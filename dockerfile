FROM node:boron
RUN mkdir -p /app
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
EXPOSE 3000
ENV MONGO="mongodb://localhost:27017/tforex"
CMD ["npm", "start"]