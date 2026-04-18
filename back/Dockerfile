FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@10.28.1 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@10.28.1 --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# prisma.config.ts requires DATABASE_URL at config load time; not used to connect during generate
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/template_api?schema=public
RUN pnpm prisma generate && pnpm run build

FROM node:22-alpine AS runtime
RUN corepack enable && corepack prepare pnpm@10.28.1 --activate
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/package.json ./
ARG PORT=3333
ENV PORT=${PORT}
EXPOSE ${PORT}
CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/main.js"]
