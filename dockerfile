FROM node:boron
RUN mkdir -p /app
WORKDIR /app
COPY package.json /app
RUN npm install --production
COPY . /app
EXPOSE 3000
ENV MONGO="mongodb://172.17.0.3:27017/tforex"
CMD ["npm", "start"]