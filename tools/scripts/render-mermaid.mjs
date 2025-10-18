#!/usr/bin/env node

/**
 * Renders every .mmd diagram in doc/diagrams as an SVG using Mermaid CLI.
 * Run via: node tools/scripts/render-mermaid.mjs
 */
import { spawn } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';

const workspaceRoot = process.cwd();
const diagramsDir = join(workspaceRoot, 'doc', 'diagrams');
const mermaidBin = join(
  workspaceRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'mmdc.cmd' : 'mmdc'
);

async function renderDiagram(sourcePath) {
  const outputPath = `${sourcePath.slice(0, -extname(sourcePath).length)}.svg`;
  await new Promise((resolve, reject) => {
    const child = spawn(mermaidBin, ['-i', sourcePath, '-o', outputPath], {
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Mermaid CLI exited with code ${code}`));
    });
  });
  console.log(`Rendered ${basename(sourcePath)} → ${basename(outputPath)}`);
}

async function main() {
  const entries = await readdir(diagramsDir, { withFileTypes: true }).catch(
    (err) => {
      if (err.code === 'ENOENT') {
        console.log('No doc/diagrams directory found. Skipping.');
        return [];
      }
      throw err;
    }
  );

  const mermaidFiles = entries
    .filter(
      (entry) => entry.isFile() && extname(entry.name).toLowerCase() === '.mmd'
    )
    .map((entry) => join(diagramsDir, entry.name));

  if (mermaidFiles.length === 0) {
    console.log('No Mermaid diagrams to render.');
    return;
  }

  for (const file of mermaidFiles) {
    await renderDiagram(file);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
