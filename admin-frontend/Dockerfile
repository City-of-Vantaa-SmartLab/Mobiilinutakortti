FROM node:24.11.0-alpine
WORKDIR /admin-frontend
COPY package*.json ./
ARG BUILD_ID
# Bust cache for npm i.
RUN echo "BUILD_ID $BUILD_ID"
RUN npm i
COPY . .
VOLUME ["/admin-frontend/src"]
CMD ["npm", "run", "dev"]
