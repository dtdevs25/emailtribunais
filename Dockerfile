# Stage 1: Build Frontend
FROM node:20-alpine AS build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Final Backend Image
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
# Copy frontend build to backend's public folder
COPY --from=build-frontend /app/frontend/dist ./public

ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "src/index.js"]
