import { bundle } from "@remotion/bundler";
import { renderMedia, getCompositions } from "@remotion/renderer";
import { parseMedia } from "@remotion/media-parser";
import { nodeReader } from "@remotion/media-parser/node";
import path from "path";
import fs from "fs";

async function main() {
  const args = process.argv.slice(2);
  const inputDir = getArg(args, "--input-dir") || "../../output/videos/PROCORP-2026-001";
  const outputFile = getArg(args, "--output-file") || "../../output/videos/PROCORP/final/hero-video-final.mp4";
  const fps = parseInt(getArg(args, "--fps") || "30", 10);

  const resolvedInput = path.resolve(__dirname, inputDir);
  const resolvedOutput = path.resolve(__dirname, outputFile);

  console.log(`Input directory: ${resolvedInput}`);
  console.log(`Output file: ${resolvedOutput}`);

  // Find all mp4 files
  const filenames = fs.readdirSync(resolvedInput)
    .filter((f) => f.endsWith(".mp4"))
    .sort();

  if (filenames.length === 0) {
    console.error("No .mp4 files found in", resolvedInput);
    process.exit(1);
  }

  console.log(`Found ${filenames.length} clips:`);

  // Get duration of each clip using node file reader
  const clips = [];
  for (const filename of filenames) {
    const fullPath = path.join(resolvedInput, filename);
    let durationInFrames = fps * 5; // default 5s
    try {
      const metadata = await parseMedia({
        src: fullPath,
        fields: { durationInSeconds: true },
        reader: nodeReader,
        acknowledgeRemotionLicense: true,
      });
      if (metadata.durationInSeconds) {
        durationInFrames = Math.ceil(metadata.durationInSeconds * fps);
        console.log(`  ${filename}: ${metadata.durationInSeconds.toFixed(1)}s (${durationInFrames} frames)`);
      }
    } catch {
      console.warn(`  ${filename}: using 5s default`);
    }
    // Use staticFile path — filename served from publicDir
    clips.push({ src: filename, durationInFrames });
  }

  const totalFrames = clips.reduce((sum, c) => sum + c.durationInFrames, 0);
  console.log(`\nTotal: ${(totalFrames / fps).toFixed(1)}s (${totalFrames} frames at ${fps}fps)`);

  // Ensure output directory exists
  const outputDir = path.dirname(resolvedOutput);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Bundle — publicDir points to input dir so videos are served as static files
  console.log("\nBundling...");
  const bundled = await bundle({
    entryPoint: path.join(__dirname, "src/index.ts"),
    webpackOverride: (config) => config,
    publicDir: resolvedInput,
  });

  // Get compositions
  const compositions = await getCompositions(bundled, {
    inputProps: { clips },
  });

  const composition = compositions.find((c) => c.id === "CombineClips");
  if (!composition) {
    console.error("Composition 'CombineClips' not found");
    process.exit(1);
  }

  // Render
  console.log(`Rendering ${filenames.length} clips → ${path.basename(resolvedOutput)}...`);
  await renderMedia({
    composition: {
      ...composition,
      durationInFrames: totalFrames,
      fps,
      width: 1920,
      height: 1080,
    },
    serveUrl: bundled,
    codec: "h264",
    outputLocation: resolvedOutput,
    inputProps: { clips },
    onProgress: ({ progress }) => {
      process.stdout.write(`\r  Progress: ${Math.round(progress * 100)}%`);
    },
  });

  console.log(`\n\nVideo final: ${resolvedOutput}`);
  const stat = fs.statSync(resolvedOutput);
  console.log(`Tamano: ${(stat.size / 1024 / 1024).toFixed(1)} MB`);
}

function getArg(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
