FROM node:boron
RUN mkdir -p /app
WORKDIR /app
COPY package.json /app
RUN npm install --production
COPY . /app
EXPOSE 3000
ENV MONGO="mongodb://127.0.0.1:27017/tforex"
CMD ["npm", "start"]