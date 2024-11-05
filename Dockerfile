FROM node:18-alpine
ARG port=4000
ARG config=.env.sample

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY $config ./.env

RUN npm install
# If you are building your code for production
# RUN npm ci --omit=dev

# Bundle app source
COPY . .

RUN npm run build

ENV PORT=$port
EXPOSE $port:$port

CMD [ "npm", "start" ]