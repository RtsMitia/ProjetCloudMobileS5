FROM node:18-alpine AS build

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build

### Production image
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Replace default nginx config with SPA-friendly one
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
