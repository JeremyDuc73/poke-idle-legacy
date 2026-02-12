# ---- Dev Stage (no build, just deps) ----
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npx", "nuxt", "dev", "--host", "0.0.0.0"]

# ---- Build Stage ----
FROM dev AS builder
RUN npx nuxt build

# ---- Production Stage ----
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.output ./
EXPOSE 3000
CMD ["node", "server/index.mjs"]
