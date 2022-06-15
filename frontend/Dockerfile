FROM node:16.15.1

RUN mkdir -p /frontend
WORKDIR /frontend

COPY package.json /frontend

COPY . /frontend
RUN npm install


CMD ["npm", "install"]
CMD ["npm", "start"]
