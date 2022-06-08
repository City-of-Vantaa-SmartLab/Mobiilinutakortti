FROM node:16
WORKDIR /admin-frontend
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
