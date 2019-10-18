FROM node:10.10.0-alpine

RUN mkdir -p /frontend
WORKDIR /frontend

COPY package.json /frontend

COPY . /frontend
RUN npm install


CMD ["npm", "install"]