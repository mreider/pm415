FROM node:10
COPY --from=nyt91548.live.dynatrace.com/linux/oneagent-codemodules:nodejs / /
ENV LD_PRELOAD /opt/dynatrace/oneagent/agent/lib64/liboneagentproc.so

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
