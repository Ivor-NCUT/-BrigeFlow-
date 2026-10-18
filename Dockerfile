FROM node:24.15.0-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY --chown=node:node backend ./backend
COPY --chown=node:node dist ./dist
USER node
ENV NODE_ENV=production PORT=3001
EXPOSE 3001
CMD ["npm", "start"]
