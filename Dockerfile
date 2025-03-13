FROM node:22.12.0

ENV TZ=Europe/Helsinki
RUN rm -f /etc/localtime && ln -s /usr/share/zoneinfo/$TZ /etc/localtime

ARG REACT_APP_ENABLE_EXTRA_ENTRIES
ENV REACT_APP_ENABLE_EXTRA_ENTRIES=$REACT_APP_ENABLE_EXTRA_ENTRIES
ARG REACT_APP_ENABLE_KOMPASSI_INTEGRATION
ENV REACT_APP_ENABLE_KOMPASSI_INTEGRATION=$REACT_APP_ENABLE_KOMPASSI_INTEGRATION
ARG REACT_APP_ENTRA_TENANT_ID
ENV REACT_APP_ENTRA_TENANT_ID=$REACT_APP_ENTRA_TENANT_ID
ARG REACT_APP_ENTRA_CLIENT_ID
ENV REACT_APP_ENTRA_CLIENT_ID=$REACT_APP_ENTRA_CLIENT_ID
ARG REACT_APP_ENTRA_REDIRECT_URI
ENV REACT_APP_ENTRA_REDIRECT_URI=$REACT_APP_ENTRA_REDIRECT_URI

ADD ./frontend /frontend
ADD ./admin-frontend /admin-frontend
ADD ./backend /backend

WORKDIR /frontend
RUN npm ci && npm run build && cp -r ./build ../backend/public
WORKDIR /admin-frontend
RUN npm ci && npm run build && cp -r ./build ../backend/public-admin
WORKDIR /backend
RUN npm ci && npm run build

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
