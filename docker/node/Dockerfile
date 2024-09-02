FROM node:22-alpine3.19

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 8081

CMD ["node", "app.js"]