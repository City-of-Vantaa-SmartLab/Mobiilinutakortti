FROM node:20.11.0
ENV TZ=Europe/Helsinki
RUN rm -f /etc/localtime && ln -s /usr/share/zoneinfo/$TZ /etc/localtime
ADD ./backend /backend
ADD ./frontend /frontend
ENV REACT_APP_ENDPOINT=/api
ENV REACT_APP_ADMIN_FRONTEND_URL=/nuorisotyontekijat
WORKDIR /frontend
RUN npm ci && npm run build && cp -r ./build ../backend/public
ADD ./admin-frontend /admin-frontend
WORKDIR /admin-frontend
RUN npm ci && npm run build && cp -r ./build ../backend/public-admin
WORKDIR /backend
RUN npm ci && npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
