# ---- build stage: full dependencies, compile TypeScript, generate Prisma client ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ---- runtime stage: production dependencies only ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# The generated Prisma client lives inside node_modules and is not reproduced
# by `npm ci`, so it has to be carried over from the build stage.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
# Demo images, uploaded to object storage on first boot. Resolved relative to
# the compiled code at dist/, so this must sit beside it at /app.
COPY seed-assets ./seed-assets

EXPOSE 4000

# Migrations run at startup. Compose gates this container on the database
# healthcheck, so Postgres is guaranteed to be accepting connections by now.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
