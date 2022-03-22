FROM node:17.7.2

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000 41233
CMD [ "npm", "run", "start-server" ]