#!/usr/bin/env bash

npm run-script build
cp -r ./build /var/lib/nginx/adex-dapp/
chown -R www-data:www-data /var/lib/nginx/adex-dapp/build