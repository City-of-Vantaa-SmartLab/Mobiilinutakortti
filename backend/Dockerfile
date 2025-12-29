FROM node:24.11.0-alpine
RUN rm -f /etc/localtime && ln -s /usr/share/zoneinfo/Europe/Helsinki /etc/localtime
WORKDIR /backend
COPY package*.json ./
RUN npm i
COPY . .
CMD ["npm", "run", "dev"]
