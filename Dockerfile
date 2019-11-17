FROM node:10
ENV TZ=Europe/Helsinki
RUN rm -f /etc/localtime
RUN ln -s /usr/share/zoneinfo/$TZ /etc/localtime
WORKDIR /backend
ADD ./backend /backend
RUN npm install
ADD ./frontend /frontend
WORKDIR /frontend
RUN npm install
RUN npm run build
RUN cp -r ./build ../backend/public
ADD ./admin-frontend /admin-frontend
WORKDIR /admin-frontend
RUN npm install
RUN npm run build
RUN cp -r ./build ../backend/public-admin
WORKDIR /backend
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]