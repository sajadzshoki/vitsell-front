# Nuxt 4 Minimal Starter

Look at the [Nuxt 4 documentation](https://nuxt.com/docs/4.x/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:4000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/4.x/getting-started/deployment) for more information.

## Production deploy (vitsell)

### Backend (API)

```bash
docker compose -f docker-compose.prod.yml build --progress=plain
docker compose -f docker-compose.prod.yml up -d
docker exec -it api node ace migration:run
```

### Frontend (store)

**A — Build on the server** (full Nuxt source present; recommended if the repo is on the VPS):

```bash
docker compose -f docker-compose.prod.yml up -d --build --force-recreate
```

This rebuilds **store** (`:3000`) and **admin** (`:3001`, `NUXT_PUBLIC_APP_MODE=admin`). Point `seller.vitsell.ir` at port `3001` (or `ADMIN_PORT`).

**B — Prebuilt `.output` only** (`docker-compose.prebuilt.yml`):

On your **local/CI** machine first:

```bash
npm ci
npm run build:store:prod
```

Then copy to the server folder **at least**:

- `.output/`  (required — without this, Docker fails with `/.output: not found`)
- `Dockerfile.prebuilt`
- `docker-compose.prebuilt.yml`

On the server:

```bash
# confirm .output exists
ls -la .output/server/index.mjs

docker compose -f docker-compose.prebuilt.yml up -d --build --force-recreate
```

Do **not** run `prebuilt` on a folder that only has compose/Dockerfile and no `.output`.
