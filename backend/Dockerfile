# Imagen del backend: API REST con Node.js y Express
FROM node:20-alpine

WORKDIR /app

# Se instalan primero las dependencias para aprovechar la cache de capas
COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 4000
CMD ["npm", "start"]
