FROM node:16.15.1
WORKDIR /admin-frontend
COPY package*.json ./
ARG BUILD_ID
# Bust cache for npm i.
RUN echo "BUILD_ID $BUILD_ID"
RUN npm i
COPY . .
VOLUME ["/admin-frontend/src"]
CMD ["npm", "start"]
