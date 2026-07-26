# ---- build stage ----
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- runtime stage ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# The standalone server binds to localhost unless told otherwise, which would
# leave the published port unreachable from outside the container.
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# `output: standalone` emits a server bundle with only the modules it actually
# uses, so no node_modules install is needed here. Static assets are not part
# of that bundle and are copied separately.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
