# vitsell storefront — Nuxt 4 SSR (Nitro)
# CI/CD: pass NUXT_PUBLIC_* as --build-arg. Do not COPY .env into the image.
# (No `# syntax=docker/dockerfile:1` — Docker Hub often returns 403 for that frontend image.)

FROM node:24-bookworm-slim AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

FROM node:24-bookworm-slim AS build
WORKDIR /app

ARG NUXT_PUBLIC_APP_MODE=store
ARG NUXT_PUBLIC_API_BASE=https://api.vitsell.ir/api/v1
ARG NUXT_PUBLIC_STORE_URL=https://vitsell.ir
ARG NUXT_PUBLIC_ADMIN_URL=https://seller.vitsell.ir
ARG NUXT_PUBLIC_APP_VERSION=beta.0.1

ENV NUXT_PUBLIC_APP_MODE=$NUXT_PUBLIC_APP_MODE \
    NUXT_PUBLIC_API_BASE=$NUXT_PUBLIC_API_BASE \
    NUXT_PUBLIC_STORE_URL=$NUXT_PUBLIC_STORE_URL \
    NUXT_PUBLIC_ADMIN_URL=$NUXT_PUBLIC_ADMIN_URL \
    NUXT_PUBLIC_APP_VERSION=$NUXT_PUBLIC_APP_VERSION \
    NODE_ENV=production \
    NITRO_PRESET=node-server

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    NITRO_PORT=3000 \
    NITRO_HOST=0.0.0.0

RUN groupadd --system --gid 1001 nuxt \
  && useradd --system --uid 1001 --gid nuxt nuxt

COPY --from=build --chown=nuxt:nuxt /app/.output ./.output

USER nuxt
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/robots.txt').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", ".output/server/index.mjs"]
