import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BrowserManager } from '../browser.js';
import { formatError } from '../utils/errors.js';
import { SELECTORS, LOGIN_URL } from '../utils/selectors.js';

export function registerInspectTools(server: McpServer, browser: BrowserManager): void {
  server.tool(
    'flow_screenshot',
    'Take a screenshot of the current Google Flow page',
    { full_page: z.boolean().optional().describe('Capture full page (default: viewport only)') },
    async ({ full_page }) => {
      try {
        const screenshot = await browser.takeScreenshot(full_page ?? false);
        return {
          content: [
            { type: 'image' as const, data: screenshot.toString('base64'), mimeType: 'image/png' as const },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Screenshot failed: ${formatError(err)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'flow_snapshot',
    'Get the accessibility tree snapshot of the current page (structured text, no vision needed)',
    {},
    async () => {
      try {
        const snapshot = await browser.getAccessibilitySnapshot();
        return {
          content: [{ type: 'text' as const, text: snapshot }],
        };
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Snapshot failed: ${formatError(err)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'flow_get_status',
    'Get structured status of the current Google Flow page: URL, model, progress, errors',
    {},
    async () => {
      try {
        const page = await browser.getPage();
        const url = page.url();

        // Check for login redirect
        if (url.includes(LOGIN_URL)) {
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                status: 'session_expired',
                url,
                message: 'Google session expired. Re-authenticate and update the storage state file.',
              }, null, 2),
            }],
            isError: true,
          };
        }

        // Extract page state
        const status = await page.evaluate((selectors) => {
          const result: Record<string, unknown> = {
            url: window.location.href,
            title: document.title,
          };

          // Check for video player
          const video = document.querySelector('video');
          result.hasVideoResult = !!video;
          if (video) {
            result.videoSrc = video.src || null;
          }

          // Check for progress bar
          const progressBar = document.querySelector('[role="progressbar"]');
          if (progressBar) {
            result.isGenerating = true;
            result.progress = progressBar.getAttribute('aria-valuenow') || progressBar.textContent?.trim();
          } else {
            result.isGenerating = false;
          }

          // Check for errors
          const errorEl = document.querySelector('[role="alert"]');
          if (errorEl) {
            result.error = errorEl.textContent?.trim();
          }

          // Check for prompt input
          const textarea = document.querySelector('textarea');
          result.hasPromptInput = !!textarea;
          if (textarea) {
            result.currentPrompt = (textarea as HTMLTextAreaElement).value;
          }

          return result;
        }, SELECTORS);

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(status, null, 2),
          }],
        };
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Get status failed: ${formatError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
