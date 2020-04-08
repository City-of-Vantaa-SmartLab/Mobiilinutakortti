FROM node:10
WORKDIR /admin-frontend
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
