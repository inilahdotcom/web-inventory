# ---- Base ----
# Seluruh build memakai Node, bukan Bun: di agent Jenkins runtime Bun berputar
# 100% CPU tanpa syscall (husky, vite build, lalu bun install sendiri macet).
# Harus image glibc (bukan alpine) agar cocok dengan binding native di lockfile.
FROM node:24-slim AS base
WORKDIR /usr/src/app

# ---- Install dependencies (di-cache selama package.json & package-lock.json tidak berubah) ----
FROM base AS install
COPY package.json package-lock.json ./
# --ignore-scripts: lewati `prepare` (husky) - git hooks tidak berguna di image
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts

# ---- Build ----
FROM base AS build
COPY --from=install /usr/src/app/node_modules node_modules
COPY . .
# .env ikut ke build; Vite menanamkan VITE_* ke bundle
ENV NODE_ENV=production
# routeTree.gen.ts dibuat plugin Vite, jadi vite build dulu baru type-check
RUN npx vite build && npx tsc -b

# ---- Release: hanya file statis + nginx non-root ----
FROM nginxinc/nginx-unprivileged:alpine AS release
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
EXPOSE 5000
