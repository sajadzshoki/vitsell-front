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

backend update : 
docker compose -f docker-compose.prod.yml build --progress=plain

docker compose -f docker-compose.prod.yml up -d

docker exec -it api node ace migration:run


front update : 
docker compose -f docker-compose.prebuilt.yml up -d
