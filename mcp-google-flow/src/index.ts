#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { parseArgs } from './utils/args.js';
import { BrowserManager } from './browser.js';
import { createServer } from './server.js';

async function main() {
  const config = parseArgs(process.argv.slice(2));
  const browser = new BrowserManager(config);
  const server = createServer(browser, config);
  const transport = new StdioServerTransport();

  // Graceful shutdown
  const shutdown = async () => {
    await browser.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  await server.connect(transport);
}

main().catch((err) => {
  console.error('Failed to start google-flow MCP server:', err);
  process.exit(1);
});
