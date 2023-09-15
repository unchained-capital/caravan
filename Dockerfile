FROM node:16-buster-slim AS builder

# Install all OS dependencies
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update --yes && \
    apt-get upgrade --yes && \
    apt-get install --yes --no-install-recommends \
    build-essential

# Copy over required files for build
WORKDIR /var/app
COPY fixtures /var/app/fixtures
COPY public /var/app/public
COPY src /var/app/src
COPY babel.config.json jest.config.json vite.config.ts tsconfig.json tsconfig.node.json .env vite-env.d.ts .eslintignore .eslintrc package-lock.json index.html package.json /var/app/

# Build the app
RUN npm install
RUN npm run build

# Serve the production build files via nginx (will be served at http://localhost:80/caravan)
FROM nginx:1.23
COPY --from=builder /var/app/build /usr/share/nginx/html/caravan
