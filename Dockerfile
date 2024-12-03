FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

RUN npm run build

# runner 

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
ENV NODE_ENV=production
RUN npm ci
COPY --from=builder /app/dist ./dist
RUN chown -R node:node /app && chmod -R 755 /app
RUN npm install pm2 -g
COPY ecosystem.config.js .
USER node
EXPOSE 8000
CMD [ "pm2-runtime","start" ,"ecosystem.config.js"]