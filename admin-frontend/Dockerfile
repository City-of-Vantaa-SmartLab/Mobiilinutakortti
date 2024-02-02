FROM node:20.11.0
WORKDIR /admin-frontend
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "start"]
