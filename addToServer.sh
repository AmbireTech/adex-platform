#!/usr/bin/env bash
USERNAME=$1
HOSTNAME=$2

npm run-script build

rsync -av ./build ${USERNAME}@${HOSTNAME}:/var/lib/nginx/adex-dapp/

ssh ${USERNAME}@${HOSTNAME} "chown -R www-data:www-data /var/lib/nginx/adex-dapp/build"