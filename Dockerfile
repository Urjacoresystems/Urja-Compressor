# Debian (glibc) based images: the workspace excludes musl native binaries (lightningcss, tailwind oxide),
# so Alpine cannot build this app.

# ---------- base: node + pnpm ----------
FROM node:22-slim AS base
RUN npm install -g pnpm@10
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# ---------- deps: install only what the web app needs, from the root pnpm-lock.yaml ----------
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY artifacts/api-server/package.json artifacts/api-server/
COPY artifacts/mockup-sandbox/package.json artifacts/mockup-sandbox/
COPY artifacts/urja-compressor/package.json artifacts/urja-compressor/
COPY lib/api-client-react/package.json lib/api-client-react/
COPY lib/api-spec/package.json lib/api-spec/
COPY lib/api-zod/package.json lib/api-zod/
COPY lib/db/package.json lib/db/
COPY scripts/package.json scripts/
RUN pnpm install --frozen-lockfile --filter "@workspace/urja-compressor..."

# ---------- builder ----------
FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/artifacts/urja-compressor/node_modules ./artifacts/urja-compressor/node_modules
RUN pnpm --filter @workspace/urja-compressor run build

# ---------- runner: no pnpm, runs as the built-in non-root "node" user ----------
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=builder --chown=node:node /app/artifacts/urja-compressor/.next/standalone ./
COPY --from=builder --chown=node:node /app/artifacts/urja-compressor/.next/static ./artifacts/urja-compressor/.next/static
COPY --from=builder --chown=node:node /app/artifacts/urja-compressor/public ./artifacts/urja-compressor/public

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ["node", "-e", "fetch('http://localhost:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]

CMD ["node", "artifacts/urja-compressor/server.js"]