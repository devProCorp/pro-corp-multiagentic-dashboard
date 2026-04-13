import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { BrowserManager } from './browser.js';
import type { FlowConfig } from './utils/args.js';
import { registerNavigateTools } from './tools/navigate.js';
import { registerVideoTools } from './tools/video.js';
import { registerDownloadTools } from './tools/download.js';
import { registerInspectTools } from './tools/inspect.js';
import { registerGenericTools } from './tools/generic.js';

export function createServer(browser: BrowserManager, config: FlowConfig): McpServer {
  const server = new McpServer(
    {
      name: 'google-flow',
      version: '1.0.0',
    },
    {
      instructions: `This MCP server controls Google Flow (labs.google/flow) for AI video production.
Use flow_navigate first to open Flow. Then flow_generate_video to create a video (it auto-selects Veo 3.1 video mode).
Use flow_wait_for_video to poll until generation completes (~2-3 minutes).
Use flow_download_video to save the video to disk.
For diagnostics, use flow_screenshot, flow_snapshot, or flow_get_status.
Fallback tools flow_click, flow_type, and flow_run_script are available for edge cases.`,
    }
  );

  registerNavigateTools(server, browser);
  registerVideoTools(server, browser);
  registerDownloadTools(server, browser, config);
  registerInspectTools(server, browser);
  registerGenericTools(server, browser);

  return server;
}
