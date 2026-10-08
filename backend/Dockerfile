# backend/Dockerfile - FoodFlow Backend Service
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first for layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy backend application source files
COPY . .

# Expose backend port
EXPOSE 5000

# Default environment configuration (overridden by Docker Compose / environment variables)
ENV NODE_ENV=production \
    PORT=5000 \
    DB_HOST=mysql \
    DB_PORT=3306 \
    DB_NAME=foodflow

# Start backend server
CMD ["node", "server.js"]
