#!/usr/bin/env sh
set -eu

envsubst '${BITCOIN_HOST} ${BITCOIN_PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec "$@"
