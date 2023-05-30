FROM node:16.15.1
ENV TZ=Europe/Helsinki
RUN rm -f /etc/localtime
RUN ln -s /usr/share/zoneinfo/$TZ /etc/localtime
WORKDIR /backend
COPY . .
RUN npm i
VOLUME ["/backend"]
CMD ["npm", "run", "start:dev"]
