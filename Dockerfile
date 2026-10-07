FROM node:22-alpine
WORKDIR /app
COPY package.json server.js realtime-client.js index.html ./
RUN npm install --omit=dev
ENV NODE_ENV=production
EXPOSE 8787
CMD ["node", "server.js"]
