FROM node:22-bookworm-slim AS builder

WORKDIR /app
RUN npm install --global bun

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN bun run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
