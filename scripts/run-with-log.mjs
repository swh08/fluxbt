import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function runWithLog({
  logFile,
  command,
  args = [],
  cwd = process.cwd(),
  env = process.env,
}) {
  const resolvedLogFile = path.resolve(cwd, logFile);
  await mkdir(path.dirname(resolvedLogFile), { recursive: true });

  return new Promise((resolve, reject) => {
    const logStream = createWriteStream(resolvedLogFile, { flags: 'w' });
    const child = spawn(command, args, {
      cwd,
      env,
      stdio: ['inherit', 'pipe', 'pipe'],
      windowsHide: true,
    });

    const forward = (target, chunk) => {
      target.write(chunk);
      logStream.write(chunk);
    };

    child.stdout.on('data', (chunk) => forward(process.stdout, chunk));
    child.stderr.on('data', (chunk) => forward(process.stderr, chunk));

    child.on('error', (error) => {
      const message = `${error.stack ?? error.message}\n`;
      process.stderr.write(message);
      logStream.write(message);
      logStream.end(() => reject(error));
    });

    child.on('close', (code, signal) => {
      if (signal) {
        const message = `Process exited with signal ${signal}\n`;
        process.stderr.write(message);
        logStream.write(message);
      }

      logStream.end(() => resolve(code ?? 1));
    });
  });
}

async function main() {
  const [logFile, command, ...args] = process.argv.slice(2);

  if (!logFile || !command) {
    console.error('Usage: node scripts/run-with-log.mjs <log-file> <command> [args...]');
    process.exit(1);
  }

  const exitCode = await runWithLog({ logFile, command, args });
  process.exit(exitCode);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.stack ?? error.message);
    process.exit(1);
  });
}
