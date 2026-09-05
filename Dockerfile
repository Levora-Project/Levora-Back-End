# -------- build --------
FROM node:22-alpine AS build
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat
RUN corepack enable && corepack prepare pnpm@11.22.0 --activate

ENV PNPM_IGNORE_SCRIPTS=true

# Install deps (copy .npmrc if you have one; pnpm uses pnpm-lock.yaml)
COPY package.json pnpm-lock.yaml ./
# COPY .npmrc .npmrc   # uncomment if you have custom npm registry config
RUN pnpm install --frozen-lockfile --ignore-scripts

# Generate Prisma client
COPY prisma ./prisma
COPY scripts ./scripts
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1
RUN pnpm prisma:generate

# Build NestJS
COPY . .
RUN pnpm run build

# -------- runtime --------
FROM node:22-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production

# Install runtime dependencies + tini + su-exec for privilege drop
# Note: corepack is NOT needed in runtime (we only run node, not pnpm)
RUN apk add --no-cache openssl libc6-compat tini su-exec \
  && addgroup -g 1001 -S nodejs \
  && adduser -S nestjs -u 1001 -G nodejs \
  && rm -rf /var/cache/apk/* /tmp/*

# Copy prod node_modules (already includes Prisma client)
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules

COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma
COPY --chown=nestjs:nodejs package.json ./

# Create logs and uploads directory (will be fixed by entrypoint if volume mounted)
RUN mkdir -p logs uploads && chown -R nestjs:nodejs logs uploads

# Copy entrypoint script
COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/

ENV PORT=3000
EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

STOPSIGNAL SIGTERM

# Start as root, entrypoint will drop to nestjs after fixing permissions
ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]