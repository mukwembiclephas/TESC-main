# Build stage
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# --- FIXED LINE BELOW (Changed /app/build to /app/dist) ---
COPY --from=build /app/dist /usr/share/nginx/html

# Expose Nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]