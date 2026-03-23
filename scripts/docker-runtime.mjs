import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const DEFAULT_DOCKER_ENV = Object.freeze({
  AUTH_TRUST_HOST: 'true',
  DATABASE_URL: 'file:/app/db/custom.db',
  HOSTNAME: '0.0.0.0',
  NODE_ENV: 'production',
  PORT: '3000',
});

export const DEFAULT_SECRET_FILE = '/app/db/nextauth-secret';

export function resolveDockerEnv(env = process.env) {
  return {
    ...DEFAULT_DOCKER_ENV,
    ...env,
  };
}

export async function ensureNextAuthSecret(env = process.env) {
  if (env.NEXTAUTH_SECRET?.trim()) {
    return {
      created: false,
      path: null,
      secret: env.NEXTAUTH_SECRET,
      source: 'env',
    };
  }

  const secretFile = env.NEXTAUTH_SECRET_FILE ?? DEFAULT_SECRET_FILE;
  await mkdir(path.dirname(secretFile), { recursive: true });

  try {
    const existingSecret = (await readFile(secretFile, 'utf8')).trim();
    if (existingSecret) {
      env.NEXTAUTH_SECRET = existingSecret;
      return {
        created: false,
        path: secretFile,
        secret: existingSecret,
        source: 'file',
      };
    }
  } catch {
    // The secret file does not exist yet.
  }

  const generatedSecret = randomBytes(32).toString('hex');
  await writeFile(secretFile, `${generatedSecret}\n`, 'utf8');
  env.NEXTAUTH_SECRET = generatedSecret;

  return {
    created: true,
    path: secretFile,
    secret: generatedSecret,
    source: 'generated',
  };
}

export async function prepareDockerRuntime(env = process.env) {
  const runtimeEnv = resolveDockerEnv(env);
  const secret = await ensureNextAuthSecret(runtimeEnv);

  return {
    env: runtimeEnv,
    secret,
  };
}
