FROM node:20.16.0
WORKDIR /frontend
COPY package*.json ./
ARG BUILD_ID
# Bust cache for npm i.
RUN echo "BUILD_ID $BUILD_ID"
RUN npm i
COPY . .
VOLUME ["/frontend/src"]
CMD ["npm", "start"]
