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
COPY ./nginx.conf.template /etc/nginx/templates/default.conf.template
RUN ln -s /srv/caravan /srv/caravan/caravan

ENV BITCOIN_HOST bitcoind
ENV BITCOIN_PORT 18443

EXPOSE 80
EXPOSE 3034

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
