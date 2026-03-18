import { access, cp, mkdir } from 'node:fs/promises';
import path from 'node:path';

async function exists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const projectRoot = process.cwd();
  const standaloneRoot = path.join(projectRoot, '.next', 'standalone');
  const standaloneNextRoot = path.join(standaloneRoot, '.next');
  const staticSource = path.join(projectRoot, '.next', 'static');
  const staticTarget = path.join(standaloneNextRoot, 'static');
  const publicSource = path.join(projectRoot, 'public');
  const publicTarget = path.join(standaloneRoot, 'public');

  if (!(await exists(staticSource))) {
    throw new Error(`Missing build output: ${staticSource}`);
  }

  await mkdir(standaloneNextRoot, { recursive: true });
  await cp(staticSource, staticTarget, { recursive: true, force: true });

  if (await exists(publicSource)) {
    await cp(publicSource, publicTarget, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
