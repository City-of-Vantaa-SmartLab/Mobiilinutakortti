FROM node:22.12.0
ENV TZ=Europe/Helsinki
RUN rm -f /etc/localtime
RUN ln -s /usr/share/zoneinfo/$TZ /etc/localtime
WORKDIR /backend
COPY package*.json ./
ARG BUILD_ID
# Bust cache for npm i.
RUN echo "BUILD_ID $BUILD_ID"
RUN npm i
COPY . .
VOLUME ["/backend/src"]
CMD ["npm", "run", "start:dev"]
