# Multi-stage Dockerfile for QuizMaster Full-Stack Platform
# Stage 1: Build React frontend
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
ENV NODE_OPTIONS="--openssl-legacy-provider"
RUN npm run build

# Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000
ENV DB_PATH=/app/server/data/quizmaster.db

# Dependencies needed for better-sqlite3 native build on alpine
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --legacy-peer-deps --only=production

COPY server ./server
COPY --from=builder /app/build ./build

# Ensure SQLite storage directory exists
RUN mkdir -p /app/server/data

EXPOSE 5000

CMD ["node", "server/index.js"]
