# Dockerfile para desarrollo
FROM node:18-alpine

# Instalar herramientas necesarias
RUN apk add --no-cache postgresql-client netcat-openbsd

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies)
RUN npm install

# Copiar código fuente
COPY . .

# Crear directorio para uploads
RUN mkdir -p uploads

#  Exponer puerto
EXPOSE 3001

#  Compilar la aplicación
RUN npm run build


CMD ["node", "dist/main.js"]


# CMD ["npm", "run", "start:prod"]