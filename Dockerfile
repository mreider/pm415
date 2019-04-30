FROM node:10

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)

RUN apt-get update && apt-get install -y mysql-client && rm -rf /var/lib/apt
COPY package*.json ./
RUN npm install
RUN npm i -g knex
COPY . .
EXPOSE 8080
CMD [ "npm", "start" ]
