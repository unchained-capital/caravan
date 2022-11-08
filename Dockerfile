FROM node:14-buster-slim AS builder

# Install all OS dependencies
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update --yes && \
    apt-get upgrade --yes && \
    apt-get install --yes --no-install-recommends \
    build-essential

# Copy over required files for build
WORKDIR /var/app
COPY config /var/app/config
COPY fixtures /var/app/fixtures
COPY public /var/app/public
COPY src /var/app/src
COPY .babelrc .env .eslintignore .eslintrc package-lock.json package.json /var/app/

# Build the app
RUN npm install
RUN npm run build

# Serve the production build files via nginx (will be served at http://localhost:80/caravan)
FROM nginx:1.23
COPY --from=builder /var/app/build /usr/share/nginx/html/caravan