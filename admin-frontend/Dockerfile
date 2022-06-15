FROM node:16.15.1
WORKDIR /admin-frontend
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
