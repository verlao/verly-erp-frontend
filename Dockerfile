# Multi-stage build for Vue.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install dependencies (cached if package.json unchanged)
RUN npm ci

# Copy source code only after deps are installed
COPY . .

# Build application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy optimized nginx configuration for Docker
COPY nginx.docker.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Health check using wget (built-in on alpine)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]