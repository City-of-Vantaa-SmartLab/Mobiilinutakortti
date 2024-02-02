FROM node:20.11.0
ENV TZ=Europe/Helsinki
RUN rm -f /etc/localtime
RUN ln -s /usr/share/zoneinfo/$TZ /etc/localtime
WORKDIR /backend
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "run", "start:dev"]
