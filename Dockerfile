# Multi-stage build for React app with Vite
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Set build-time environment variables (these will be baked into the build)
ARG REACT_APP_API_BASE_URL=http://localhost:3001
ARG REACT_APP_MSTR_API_URL=http://localhost:8001
ARG REACT_APP_COGNOS_API_URL=http://localhost:8003
ARG REACT_APP_TABLEAU_API_URL=http://localhost:8004
ARG REACT_APP_ENV=docker
ARG REACT_APP_DEBUG=false
ARG REACT_APP_API_TIMEOUT=30000

# Build the React app with Vite
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built app from build stage (Vite outputs to 'dist' by default)
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000 to match external deployment
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

