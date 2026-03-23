FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json package-lock.json .npmrc ./
COPY prisma ./prisma
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS prisma-cli
COPY package-lock.json ./
RUN PRISMA_VERSION="$(node -p "require('./package-lock.json').packages['node_modules/prisma'].version")" \
  && npm init -y >/dev/null 2>&1 \
  && npm install --omit=dev --no-package-lock "prisma@${PRISMA_VERSION}"

FROM base AS runner
ENV NODE_ENV=production

COPY --from=prisma-cli /app/node_modules ./prisma-cli/node_modules
COPY --from=builder /app/.next/standalone ./.next/standalone
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts

RUN mkdir -p /app/db

EXPOSE 3000

CMD ["node", "scripts/start-docker.mjs"]
