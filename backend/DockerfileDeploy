FROM node:10
WORKDIR /backend
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "start:prod"]