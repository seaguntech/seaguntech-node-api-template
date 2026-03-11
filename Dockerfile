FROM node:22-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run prisma:generate
RUN pnpm run build

FROM node:22-alpine AS production

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=base /app/package.json /app/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules/.pnpm/@prisma+client*/node_modules/.prisma ./node_modules/.prisma
COPY --from=base /app/node_modules/.pnpm/prisma*/node_modules/prisma ./node_modules/prisma
COPY --from=base /app/node_modules/.pnpm/@prisma+engines*/node_modules/@prisma ./node_modules/@prisma
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

CMD ["sh", "-c", "node_modules/prisma/build/index.js migrate deploy && node dist/src/main.js"]
