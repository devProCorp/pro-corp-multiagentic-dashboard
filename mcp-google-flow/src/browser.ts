import { chromium, type Browser, type BrowserContext, type Page, type Download } from 'playwright';
import { FlowError } from './utils/errors.js';
import { FLOW_URL, FLOW_BASE, LOGIN_URL } from './utils/selectors.js';
import type { FlowConfig } from './utils/args.js';

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private config: FlowConfig;
  private pendingDownload: Download | null = null;

  constructor(config: FlowConfig) {
    this.config = config;
  }

  async getPage(): Promise<Page> {
    if (this.page && !this.page.isClosed() && this.browser?.isConnected()) {
      return this.page;
    }

    await this.close();

    this.browser = await chromium.launch({
      headless: false,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-first-run',
        '--no-default-browser-check',
      ],
    });

    this.context = await this.browser.newContext({
      storageState: this.config.storageStatePath,
      viewport: { width: 1280, height: 900 },
      locale: 'es-ES',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    });

    this.page = await this.context.newPage();

    // Listen for downloads
    this.page.on('download', (download) => {
      this.pendingDownload = download;
    });

    return this.page;
  }

  async ensureOnFlow(): Promise<Page> {
    const page = await this.getPage();
    const url = page.url();

    if (url.includes(LOGIN_URL)) {
      throw new FlowError('SESSION_EXPIRED', 'Google session expired. Re-authenticate and update the storage state file.');
    }

    if (!url.startsWith(FLOW_BASE)) {
      await page.goto(FLOW_URL, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForLoadState('domcontentloaded');
    }

    // Check again for login redirect after navigation
    if (page.url().includes(LOGIN_URL)) {
      throw new FlowError('SESSION_EXPIRED', 'Google session expired after navigation. Re-authenticate and update the storage state file.');
    }

    return page;
  }

  async takeScreenshot(fullPage: boolean = false): Promise<Buffer> {
    const page = await this.getPage();
    return await page.screenshot({ fullPage, type: 'png' });
  }

  async getAccessibilitySnapshot(): Promise<string> {
    const page = await this.getPage();
    // Use Playwright's aria snapshot (modern API replacing deprecated accessibility.snapshot)
    const snapshot = await page.locator('body').ariaSnapshot();
    return snapshot;
  }

  async waitForDownload(timeoutMs: number = 60000): Promise<Download> {
    const page = await this.getPage();
    this.pendingDownload = null;

    const download = await page.waitForEvent('download', { timeout: timeoutMs });
    return download;
  }

  /**
   * Try clicking using a cascade of selectors. Returns the selector that worked.
   */
  async clickFirstMatch(selectors: string[], options?: { timeout?: number }): Promise<string> {
    const page = await this.getPage();
    const timeout = options?.timeout ?? 5000;

    for (const selector of selectors) {
      try {
        await page.click(selector, { timeout });
        return selector;
      } catch {
        continue;
      }
    }

    throw new FlowError(
      'ELEMENT_NOT_FOUND',
      `None of these selectors matched: ${selectors.join(', ')}`
    );
  }

  /**
   * Try finding a visible element using a cascade of selectors.
   */
  async findFirstMatch(selectors: string[], options?: { timeout?: number }): Promise<string | null> {
    const page = await this.getPage();
    const timeout = options?.timeout ?? 3000;

    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout, state: 'visible' });
        return selector;
      } catch {
        continue;
      }
    }

    return null;
  }

  async close(): Promise<void> {
    try {
      if (this.page && !this.page.isClosed()) {
        await this.page.close().catch(() => {});
      }
      if (this.context) {
        await this.context.close().catch(() => {});
      }
      if (this.browser?.isConnected()) {
        await this.browser.close().catch(() => {});
      }
    } finally {
      this.page = null;
      this.context = null;
      this.browser = null;
    }
  }
}
