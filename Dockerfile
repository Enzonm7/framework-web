# Étape 1 : Build de l'application Vue
FROM node:22-alpine AS build
WORKDIR /app
COPY Art/package.json Art/package-lock.json* ./
RUN npm install
COPY Art/ .
RUN npm run build

# Étape 2 : Servir avec Nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
