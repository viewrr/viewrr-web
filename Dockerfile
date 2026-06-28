# Build the SPA with bun, serve the static dist with nginx.
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# Bake the Hub URL at build time (empty → client uses mock fallback).
# Set via --build-arg / the release workflow's VITE_API_BASE repo variable.
ARG VITE_API_BASE=""
ENV VITE_API_BASE=$VITE_API_BASE
# Artifact only — typecheck/tests run in CI, not in the deploy image.
RUN bunx vite build

FROM nginx:alpine AS serve
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
