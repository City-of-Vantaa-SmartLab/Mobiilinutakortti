FROM node:24.11.0-alpine

RUN rm -f /etc/localtime && ln -s /usr/share/zoneinfo/Europe/Helsinki /etc/localtime

ARG VITE_ENABLE_EXTRA_ENTRIES
ENV VITE_ENABLE_EXTRA_ENTRIES=$VITE_ENABLE_EXTRA_ENTRIES
ARG VITE_ENABLE_KOMPASSI_INTEGRATION
ENV VITE_ENABLE_KOMPASSI_INTEGRATION=$VITE_ENABLE_KOMPASSI_INTEGRATION
ARG VITE_ENTRA_TENANT_ID
ENV VITE_ENTRA_TENANT_ID=$VITE_ENTRA_TENANT_ID
ARG VITE_ENTRA_CLIENT_ID
ENV VITE_ENTRA_CLIENT_ID=$VITE_ENTRA_CLIENT_ID
ARG VITE_ENTRA_REDIRECT_URI
ENV VITE_ENTRA_REDIRECT_URI=$VITE_ENTRA_REDIRECT_URI
ARG VITE_USE_ALT_ERR_MSG
ENV VITE_USE_ALT_ERR_MSG=$VITE_USE_ALT_ERR_MSG

COPY ./frontend /frontend
COPY ./admin-frontend /admin-frontend
COPY ./backend /backend

WORKDIR /frontend
RUN npm ci && npm run build && cp -r ./build ../backend/public

WORKDIR /admin-frontend
RUN npm ci && npm run build && cp -r ./build ../backend/public-admin

WORKDIR /backend
RUN npm ci && npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
