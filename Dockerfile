FROM node:16 as build-stage
WORKDIR /usr/app/src

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM nginx
COPY --from=build-stage /usr/app/src/dist /usr/share/nginx/html

