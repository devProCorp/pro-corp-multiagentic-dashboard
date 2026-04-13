import { z } from 'zod';
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BrowserManager } from '../browser.js';
import { FlowError, formatError } from '../utils/errors.js';
import { getSelectorCascade } from '../utils/selectors.js';
import type { FlowConfig } from '../utils/args.js';

export function registerDownloadTools(server: McpServer, browser: BrowserManager, config: FlowConfig): void {
  const getOutputDir = (projectName?: string): string => {
    const baseDir = config.outputDir;
    const dir = projectName ? join(baseDir, projectName) : baseDir;
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    return dir;
  };

  server.tool(
    'flow_download_video',
    'Download a generated video from Google Flow to the local output directory. Tries multiple strategies: Playwright download interception, video src extraction, and blob URL conversion.',
    {
      filename: z.string().optional().describe('Custom filename (default: auto-generated from Flow)'),
      project_name: z.string().optional().describe('Project name for organizing in subdirectory'),
      timeout_seconds: z.number().optional().describe('Download timeout in seconds (default: 60)'),
    },
    async ({ filename, project_name, timeout_seconds }) => {
      try {
        const page = await browser.getPage();
        const outputDir = getOutputDir(project_name);
        const timeoutMs = (timeout_seconds ?? 60) * 1000;

        // Strategy 1: Try Playwright download interception
        let savedPath: string | null = null;

        try {
          // Set up download promise BEFORE clicking
          const downloadPromise = page.waitForEvent('download', { timeout: timeoutMs });

          // Try clicking download button directly
          const directDownload = await browser.findFirstMatch(
            getSelectorCascade('DOWNLOAD_BUTTON'),
            { timeout: 3000 }
          );

          if (directDownload) {
            await page.click(directDownload);
          } else {
            // Try three-dot menu approach
            await browser.clickFirstMatch(getSelectorCascade('MORE_OPTIONS_BUTTON'), { timeout: 5000 });
            await page.waitForTimeout(1000);
            await browser.clickFirstMatch(getSelectorCascade('DOWNLOAD_MENU_ITEM'), { timeout: 5000 });
          }

          const download = await downloadPromise;
          const suggestedName = filename || download.suggestedFilename() || `flow-video-${Date.now()}.mp4`;
          savedPath = join(outputDir, suggestedName);
          await download.saveAs(savedPath);
        } catch (downloadErr) {
          // Strategy 1 failed, try strategy 2
          savedPath = null;
        }

        // Strategy 2: Extract video src and fetch directly
        if (!savedPath) {
          try {
            const videoData = await page.evaluate(async () => {
              const video = document.querySelector('video');
              if (!video || !video.src) return null;

              const response = await fetch(video.src);
              const blob = await response.blob();
              const reader = new FileReader();

              return new Promise<string>((resolve, reject) => {
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
            });

            if (videoData) {
              const base64Data = videoData.split(',')[1];
              if (base64Data) {
                const buffer = Buffer.from(base64Data, 'base64');
                const saveName = filename || `flow-video-${Date.now()}.mp4`;
                savedPath = join(outputDir, saveName);
                writeFileSync(savedPath, buffer);
              }
            }
          } catch {
            savedPath = null;
          }
        }

        // Strategy 3: Try to find blob URLs or download links in the page
        if (!savedPath) {
          try {
            const blobUrl = await page.evaluate(() => {
              // Look for any download links with blob URLs
              const links = document.querySelectorAll('a[href^="blob:"], a[download]');
              for (const link of links) {
                if ((link as HTMLAnchorElement).href) {
                  return (link as HTMLAnchorElement).href;
                }
              }

              // Look for video source elements
              const sources = document.querySelectorAll('video source');
              for (const src of sources) {
                if ((src as HTMLSourceElement).src) {
                  return (src as HTMLSourceElement).src;
                }
              }

              return null;
            });

            if (blobUrl) {
              const videoData = await page.evaluate(async (url) => {
                const response = await fetch(url);
                const blob = await response.blob();
                const reader = new FileReader();
                return new Promise<string>((resolve, reject) => {
                  reader.onload = () => resolve(reader.result as string);
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                });
              }, blobUrl);

              const base64Data = videoData.split(',')[1];
              if (base64Data) {
                const buffer = Buffer.from(base64Data, 'base64');
                const saveName = filename || `flow-video-${Date.now()}.mp4`;
                savedPath = join(outputDir, saveName);
                writeFileSync(savedPath, buffer);
              }
            }
          } catch {
            savedPath = null;
          }
        }

        if (!savedPath) {
          throw new FlowError(
            'DOWNLOAD_FAILED',
            'All download strategies failed. The video may not be ready yet, or the download UI has changed. Use flow_screenshot and flow_snapshot to diagnose.'
          );
        }

        // Verify the file
        const stats = statSync(savedPath);
        const screenshot = await browser.takeScreenshot();

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({
                success: true,
                path: savedPath,
                filename: savedPath.split('/').pop(),
                size_bytes: stats.size,
                size_mb: (stats.size / (1024 * 1024)).toFixed(2),
              }, null, 2),
            },
            { type: 'image' as const, data: screenshot.toString('base64'), mimeType: 'image/png' as const },
          ],
        };
      } catch (err) {
        const screenshot = await browser.takeScreenshot().catch(() => null);
        const content: Array<{ type: 'text'; text: string } | { type: 'image'; data: string; mimeType: 'image/png' }> = [
          { type: 'text' as const, text: `Download failed: ${formatError(err)}` },
        ];
        if (screenshot) {
          content.push({ type: 'image' as const, data: screenshot.toString('base64'), mimeType: 'image/png' as const });
        }
        return { content, isError: true };
      }
    }
  );
}
