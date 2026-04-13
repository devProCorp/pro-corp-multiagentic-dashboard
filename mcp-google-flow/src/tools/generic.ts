import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BrowserManager } from '../browser.js';
import { formatError } from '../utils/errors.js';

export function registerGenericTools(server: McpServer, browser: BrowserManager): void {
  server.tool(
    'flow_click',
    'Click an element on the page by CSS selector or text content. Fallback tool for edge cases.',
    {
      selector: z.string().describe('CSS selector or text to click (e.g., "button.primary" or "text=Click me")'),
      timeout: z.number().optional().describe('Timeout in ms (default: 5000)'),
    },
    async ({ selector, timeout }) => {
      try {
        const page = await browser.getPage();
        const ms = timeout ?? 5000;

        try {
          await page.click(selector, { timeout: ms });
        } catch {
          // Fallback: try as text selector
          await page.getByText(selector, { exact: false }).first().click({ timeout: ms });
        }

        await page.waitForTimeout(500);
        const screenshot = await browser.takeScreenshot();

        return {
          content: [
            { type: 'text' as const, text: `Clicked: ${selector}` },
            { type: 'image' as const, data: screenshot.toString('base64'), mimeType: 'image/png' as const },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Click failed: ${formatError(err)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'flow_type',
    'Type text into an element. Fallback tool for edge cases.',
    {
      selector: z.string().describe('CSS selector of the input/textarea element'),
      text: z.string().describe('Text to type'),
      clear: z.boolean().optional().describe('Clear existing text before typing (default: true)'),
    },
    async ({ selector, text, clear }) => {
      try {
        const page = await browser.getPage();

        if (clear !== false) {
          await page.fill(selector, text);
        } else {
          await page.click(selector);
          await page.keyboard.type(text);
        }

        await page.waitForTimeout(300);
        const screenshot = await browser.takeScreenshot();

        return {
          content: [
            { type: 'text' as const, text: `Typed ${text.length} characters into: ${selector}` },
            { type: 'image' as const, data: screenshot.toString('base64'), mimeType: 'image/png' as const },
          ],
        };
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Type failed: ${formatError(err)}` }],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'flow_run_script',
    'Execute arbitrary JavaScript in the page context. Returns the result serialized as JSON.',
    {
      script: z.string().describe('JavaScript code to evaluate in the page context'),
    },
    async ({ script }) => {
      try {
        const page = await browser.getPage();
        const result = await page.evaluate(script);

        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(result, null, 2) ?? 'undefined',
          }],
        };
      } catch (err) {
        return {
          content: [{ type: 'text' as const, text: `Script execution failed: ${formatError(err)}` }],
          isError: true,
        };
      }
    }
  );
}
