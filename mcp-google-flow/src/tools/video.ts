import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BrowserManager } from '../browser.js';
import { FlowError, formatError, withRetry } from '../utils/errors.js';
import { getSelectorCascade } from '../utils/selectors.js';

async function selectVideoMode(browser: BrowserManager): Promise<string> {
  const page = await browser.ensureOnFlow();

  // Step 1: Click the model selector button
  await browser.clickFirstMatch(getSelectorCascade('MODEL_SELECTOR_BUTTON'), { timeout: 10000 });
  await page.waitForTimeout(1000);

  // Step 2: Click the Video tab
  await browser.clickFirstMatch(getSelectorCascade('VIDEO_TAB'), { timeout: 5000 });
  await page.waitForTimeout(1000);

  // Step 3: Verify Veo model is available/selected
  const veoSelector = await browser.findFirstMatch(getSelectorCascade('MODEL_VEO'), { timeout: 5000 });
  if (veoSelector) {
    await page.click(veoSelector).catch(() => {});
    await page.waitForTimeout(500);
  }

  // Step 4: Close the panel
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  return 'Video mode selected (Veo 3.1 Fast)';
}

export function registerVideoTools(server: McpServer, browser: BrowserManager): void {
  server.tool(
    'flow_select_video_mode',
    'Switch Google Flow to Video mode with Veo 3.1 Fast model. Must be called before generating videos if auto_select is disabled.',
    {
      model: z.string().optional().describe('Model name to select (default: Veo 3.1 - Fast)'),
    },
    async () => {
      try {
        const result = await selectVideoMode(browser);
        const screenshot = await browser.takeScreenshot();

        return {
          content: [
            { type: 'text' as const, text: result },
            { type: 'image' as const, data: screenshot.toString('base64'), mimeType: 'image/png' as const },
          ],
        };
      } catch (err) {
        const screenshot = await browser.takeScreenshot().catch(() => null);
        const content: Array<{ type: 'text'; text: string } | { type: 'image'; data: string; mimeType: 'image/png' }> = [
          { type: 'text' as const, text: `Select video mode failed: ${formatError(err)}. Use flow_snapshot to diagnose.` },
        ];
        if (screenshot) {
          content.push({ type: 'image' as const, data: screenshot.toString('base64'), mimeType: 'image/png' as const });
        }
        return { content, isError: true };
      }
    }
  );

  server.tool(
    'flow_generate_video',
    'Generate a video in Google Flow. Writes the prompt, auto-selects Veo 3.1 video mode, and clicks Create. The prompt should be in English for best results.',
    {
      prompt: z.string().describe('Video generation prompt in English. Be detailed: describe scene, camera movement, lighting, style.'),
      auto_select_video_mode: z.boolean().optional().describe('Auto-select Veo 3.1 video mode before generating (default: true)'),
    },
    async ({ prompt, auto_select_video_mode }) => {
      try {
        const page = await browser.ensureOnFlow();

        // Step 1: Auto-select video mode
        if (auto_select_video_mode !== false) {
          await withRetry(async () => {
            await selectVideoMode(browser);
          }, 1, 2000);
        }

        // Step 2: Find and fill the prompt input
        const promptSelectors = getSelectorCascade('PROMPT_INPUT');
        let promptFilled = false;

        for (const selector of promptSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 5000, state: 'visible' });
            await page.click(selector);
            await page.waitForTimeout(300);
            await page.fill(selector, prompt);
            promptFilled = true;
            break;
          } catch {
            continue;
          }
        }

        if (!promptFilled) {
          throw new FlowError('ELEMENT_NOT_FOUND', 'Could not find the prompt input field. Use flow_snapshot to inspect the page.');
        }

        await page.waitForTimeout(500);

        // Step 3: Click the Create button
        await browser.clickFirstMatch(getSelectorCascade('CREATE_BUTTON'), { timeout: 5000 });
        await page.waitForTimeout(2000);

        const screenshot = await browser.takeScreenshot();

        return {
          content: [
            {
              type: 'text' as const,
              text: `Video generation started!\nPrompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}"\nUse flow_wait_for_video to poll until completion (~2-3 minutes).`,
            },
            { type: 'image' as const, data: screenshot.toString('base64'), mimeType: 'image/png' as const },
          ],
        };
      } catch (err) {
        const screenshot = await browser.takeScreenshot().catch(() => null);
        const content: Array<{ type: 'text'; text: string } | { type: 'image'; data: string; mimeType: 'image/png' }> = [
          { type: 'text' as const, text: `Generate video failed: ${formatError(err)}` },
        ];
        if (screenshot) {
          content.push({ type: 'image' as const, data: screenshot.toString('base64'), mimeType: 'image/png' as const });
        }
        return { content, isError: true };
      }
    }
  );

  server.tool(
    'flow_wait_for_video',
    'Wait for video generation to complete in Google Flow. Polls the page at intervals until the video is ready or timeout.',
    {
      timeout_seconds: z.number().optional().describe('Max wait time in seconds (default: 300 = 5 minutes)'),
      poll_interval_seconds: z.number().optional().describe('Poll interval in seconds (default: 10)'),
    },
    async ({ timeout_seconds, poll_interval_seconds }) => {
      try {
        const page = await browser.ensureOnFlow();
        const timeoutMs = (timeout_seconds ?? 300) * 1000;
        const pollMs = (poll_interval_seconds ?? 10) * 1000;
        const startTime = Date.now();

        while (Date.now() - startTime < timeoutMs) {
          // Check for video completion
          const status = await page.evaluate(() => {
            const result: Record<string, unknown> = {};

            // Check for completed video
            const video = document.querySelector('video');
            if (video && video.src) {
              result.completed = true;
              result.videoSrc = video.src;
              return result;
            }

            // Check for progress
            const progressBar = document.querySelector('[role="progressbar"]');
            if (progressBar) {
              result.completed = false;
              result.progress = progressBar.getAttribute('aria-valuenow')
                || progressBar.textContent?.trim()
                || 'generating...';
              return result;
            }

            // Check for error
            const error = document.querySelector('[role="alert"]');
            if (error) {
              result.completed = false;
              result.error = error.textContent?.trim();
              return result;
            }

            // Check for any loading indicators
            const loading = document.querySelector('.loading, [data-loading], [aria-busy="true"]');
            if (loading) {
              result.completed = false;
              result.progress = 'loading...';
              return result;
            }

            result.completed = false;
            result.progress = 'unknown state';
            return result;
          });

          if (status.error) {
            const screenshot = await browser.takeScreenshot();
            return {
              content: [
                { type: 'text' as const, text: `Video generation error: ${status.error}` },
                { type: 'image' as const, data: screenshot.toString('base64'), mimeType: 'image/png' as const },
              ],
              isError: true,
            };
          }

          if (status.completed) {
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            const screenshot = await browser.takeScreenshot();
            return {
              content: [
                {
                  type: 'text' as const,
                  text: `Video generation complete! (${elapsed}s elapsed)\nUse flow_download_video to save it to disk.`,
                },
                { type: 'image' as const, data: screenshot.toString('base64'), mimeType: 'image/png' as const },
              ],
            };
          }

          // Wait before next poll
          await page.waitForTimeout(pollMs);
        }

        // Timeout reached
        const screenshot = await browser.takeScreenshot();
        return {
          content: [
            {
              type: 'text' as const,
              text: `Timeout after ${timeout_seconds ?? 300}s. Video may still be generating. Use flow_get_status to check.`,
            },
            { type: 'image' as const, data: screenshot.toString('base64'), mimeType: 'image/png' as const },
          ],
          isError: true,
        };
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Wait for video failed: ${formatError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
