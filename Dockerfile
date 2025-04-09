# Step 1. Rebuild the source code only when needed
# FROM oven/bun:1 AS builder
FROM node:22-slim AS builder
# Set NODE_OPTIONS to increase memory limit
ENV NODE_OPTIONS="--max-old-space-size=6144"
# ENV VITE_SCALAR_REST_URL=https://testnet.nodeapi.scalar.org
# ENV VITE_REOWN_CLOUD_PROJECT_ID=    
# ENV VITE_MEMPOOL_API=https://mempool.space
RUN npm install -g bun 
# RUN apt-get update && apt-get install -y g++ gcc make python3 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json bun.* ./
# Install dependencies with bun
# RUN bun install --no-optional || bun add -d node-gyp && bun install --no-optional
RUN bun add -d node-gyp && bun install --no-optional

COPY src ./src
COPY public ./public
COPY index.html ./
COPY components.json ./
COPY tsconfig.app.json ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./
COPY vite.config.ts ./
COPY .env ./
RUN bun run build

# Step 2. Copy build file to nginx
FROM nginx:1.27.4-bookworm-perl

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
