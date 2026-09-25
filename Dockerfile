# ---- Base ----
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# ---- Install dependencies (di-cache selama package.json & bun.lock tidak berubah) ----
FROM base AS install
COPY package.json bun.lock ./
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

# ---- Build ----
FROM base AS build
COPY --from=install /usr/src/app/node_modules node_modules
COPY . .
# .env ikut ke build; Vite menanamkan VITE_* ke bundle
ENV NODE_ENV=production
# routeTree.gen.ts dibuat plugin Vite, jadi vite build dulu baru type-check
RUN bunx vite build && bunx tsc -b

# ---- Release: hanya file statis + nginx non-root ----
FROM nginxinc/nginx-unprivileged:alpine AS release
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
EXPOSE 5000
