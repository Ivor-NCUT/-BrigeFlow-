FROM node:24.15.0-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY --chown=node:node backend/src ./backend/src
COPY --chown=node:node backend/selfhost-schema.sql ./backend/selfhost-schema.sql
COPY --chown=node:node scripts ./scripts
COPY --chown=node:node dist ./dist
COPY scripts/start-selfhost.sh /usr/local/bin/start-selfhost
ENV NODE_ENV=production PORT=3001 MEDIA_DIR=/data/avatars
EXPOSE 3001
CMD ["sh", "/usr/local/bin/start-selfhost"]
