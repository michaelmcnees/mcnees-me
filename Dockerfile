FROM oven/bun:1.3-alpine AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM caddy:2-alpine

COPY --from=build /app/dist /usr/share/caddy

EXPOSE 80
