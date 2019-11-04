FROM node:10
ENV TZ=Europe/Helsinki
RUN ln -sndatef /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
WORKDIR /backend
COPY package*.json ./
RUN npm install
COPY . .