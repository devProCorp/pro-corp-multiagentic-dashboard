import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BrowserManager } from '../browser.js';
import { formatError, withRetry } from '../utils/errors.js';
import { FLOW_URL, SELECTORS, getSelectorCascade } from '../utils/selectors.js';

export function registerNavigateTools(server: McpServer, browser: BrowserManager): void {
  server.tool(
    'flow_navigate',
    'Navigate to Google Flow main page or a specific project URL. Returns a screenshot of the loaded page.',
    {
      url: z.string().optional().describe('URL to navigate to. Defaults to Google Flow main page.'),
    },
    async ({ url }) => {
      try {
        const targetUrl = url || FLOW_URL;

        const page = await browser.getPage();
        await withRetry(async () => {
          await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
        }, 1, 3000);

        await page.waitForLoadState('domcontentloaded');

        const screenshot = await browser.takeScreenshot();
        const currentUrl = page.url();

        return {
          content: [
            { type: 'text' as const, text: `Navigated to: ${currentUrl}` },
            { type: 'image' as const, data: screenshot.toString('base64'), mimeType: 'image/png' as const },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Navigation failed: ${formatError(err)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'flow_create_project',
    'Create a new project in Google Flow',
    {
      name: z.string().describe('Name for the new project'),
    },
    async ({ name }) => {
      try {
        const page = await browser.ensureOnFlow();

        // Click new project button
        await browser.clickFirstMatch(getSelectorCascade('NEW_PROJECT_BUTTON'), { timeout: 10000 });
        await page.waitForTimeout(2000);

        const screenshot = await browser.takeScreenshot();
        const currentUrl = page.url();

        return {
          content: [
            { type: 'text' as const, text: `Project creation initiated. Name: ${name}\nCurrent URL: ${currentUrl}` },
            { type: 'image' as const, data: screenshot.toString('base64'), mimeType: 'image/png' as const },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Create project failed: ${formatError(err)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'flow_list_projects',
    'List existing projects in Google Flow',
    {},
    async () => {
      try {
        const page = await browser.ensureOnFlow();
        await page.waitForTimeout(2000);

        // Extract project info from page
        const projects = await page.evaluate((projectSelectors) => {
          const results: Array<{ name: string; url: string }> = [];

          for (const selector of projectSelectors) {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el) => {
              const link = el.closest('a') || el.querySelector('a');
              const name = el.textContent?.trim() || 'Untitled';
              const url = link?.href || '';
              if (name || url) {
                results.push({ name, url });
              }
            });
            if (results.length > 0) break;
          }

          return results;
        }, getSelectorCascade('PROJECT_CARDS'));

        return {
          content: [{
            type: 'text' as const,
            text: projects.length > 0
              ? JSON.stringify(projects, null, 2)
              : 'No projects found. The page may still be loading or the selector needs updating. Use flow_snapshot to inspect the page.',
          }],
        };
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `List projects failed: ${formatError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
