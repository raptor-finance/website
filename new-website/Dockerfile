FROM node:12.7-alpine AS build

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

FROM nginx:alpine
EXPOSE 8080

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/* /usr/share/nginx/html

RUN chown -R nginx /etc/nginx /var/run /run
RUN chmod -R a+w /var/run /run /var/cache /var/cache/nginx

USER 100