FROM node:16.15.1
WORKDIR /frontend
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "start"]
