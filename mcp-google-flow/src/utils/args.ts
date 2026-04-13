import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

export interface FlowConfig {
  storageStatePath: string;
  outputDir: string;
}

export function parseArgs(argv: string[]): FlowConfig {
  let storageStatePath = '';
  let outputDir = '';

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--storage-state' && argv[i + 1]) {
      storageStatePath = resolve(argv[++i]);
    } else if (argv[i] === '--output-dir' && argv[i + 1]) {
      outputDir = resolve(argv[++i]);
    }
  }

  if (!storageStatePath) {
    throw new Error('--storage-state <path> is required');
  }

  if (!existsSync(storageStatePath)) {
    throw new Error(`Storage state file not found: ${storageStatePath}`);
  }

  if (!outputDir) {
    outputDir = resolve('./output/videos');
  }

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  return { storageStatePath, outputDir };
}
