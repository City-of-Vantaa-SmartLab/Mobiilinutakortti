FROM node:16.15.1
ENV TZ=Europe/Helsinki
RUN rm -f /etc/localtime && ln -s /usr/share/zoneinfo/$TZ /etc/localtime
ADD ./backend /backend
ADD ./frontend /frontend
WORKDIR /frontend
RUN npm install && npm run build && cp -r ./build ../backend/public
ADD ./admin-frontend /admin-frontend
WORKDIR /admin-frontend
RUN npm install && npm run build && cp -r ./build ../backend/public-admin
WORKDIR /backend
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]