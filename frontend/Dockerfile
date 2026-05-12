# Imagen del frontend: SPA servida en modo desarrollo con Vite
FROM node:20-alpine

WORKDIR /app

# Se instalan primero las dependencias para aprovechar la cache de capas
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev"]
