FROM node:24.11.0-alpine
WORKDIR /frontend
COPY package*.json ./
RUN npm i
COPY . .
CMD ["npm", "run", "dev"]
