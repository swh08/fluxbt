import { spawn } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { prepareDockerRuntime } from './docker-runtime.mjs';
import { runWithLog } from './run-with-log.mjs';

function getPrismaBinaryPath(cwd = process.cwd()) {
  const binaryName = process.platform === 'win32' ? 'prisma.cmd' : 'prisma';
  return path.join(cwd, 'prisma-cli', 'node_modules', '.bin', binaryName);
}

function runCommand({
  command,
  args = [],
  cwd = process.cwd(),
  env = process.env,
}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env,
      stdio: 'inherit',
      windowsHide: true,
    });

    child.on('error', reject);
    child.on('close', (code, signal) => {
      if (signal) {
        reject(new Error(`Process exited with signal ${signal}`));
        return;
      }

      resolve(code ?? 1);
    });
  });
}

async function main() {
  const { env, secret } = await prepareDockerRuntime();

  if (secret.source === 'generated') {
    console.info(`Generated NEXTAUTH_SECRET and saved it to ${secret.path}.`);
  } else if (secret.source === 'file') {
    console.info(`Loaded NEXTAUTH_SECRET from ${secret.path}.`);
  } else {
    console.info('Using NEXTAUTH_SECRET from environment.');
  }

  console.info(`Using DATABASE_URL=${env.DATABASE_URL}`);

  const prismaExitCode = await runWithLog({
    logFile: 'docker-init.log',
    command: getPrismaBinaryPath(),
    args: ['db', 'push', '--skip-generate'],
    env,
  });

  if (prismaExitCode !== 0) {
    process.exit(prismaExitCode);
  }

  const serverExitCode = await runCommand({
    command: process.execPath,
    args: ['scripts/start-standalone.mjs'],
    env,
  });

  process.exit(serverExitCode);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.stack ?? error.message);
    process.exit(1);
  });
}
