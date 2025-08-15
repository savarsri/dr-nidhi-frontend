# Use Node for build
FROM node:20-alpine as builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Use Nginx for static serving
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Optional: custom nginx.conf for SPA routing
COPY nginx.conf /etc/nginx/nginx.conf
