import { access } from 'node:fs/promises';
import path from 'node:path';
import { runWithLog } from './run-with-log.mjs';

async function main() {
  const serverEntry = path.join(process.cwd(), '.next', 'standalone', 'server.js');
  await access(serverEntry);

  const exitCode = await runWithLog({
    logFile: 'server.log',
    command: process.execPath,
    args: [serverEntry],
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
  });

  process.exit(exitCode);
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
