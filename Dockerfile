FROM node:14-buster as installer
RUN mkdir -p /srv/caravan
WORKDIR /srv/caravan
COPY ./ .
RUN npm install
RUN npx browserslist@latest --update-db

FROM installer as builder
RUN npm run build

FROM nginx as caravan
COPY --from=builder /srv/caravan/build /srv/caravan
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
RUN ln -s /srv/caravan /srv/caravan/caravan

EXPOSE 80
EXPOSE 3034

CMD ["nginx", "-g", "daemon off;"]

