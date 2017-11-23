
# Node 6.x
FROM node:boron

# Meta
MAINTAINER Ivo Paunov <paunov@strem.io>
LABEL Description="AdEx dapp" Vendor="Smart Code ltd" Version="0.0.0"

#------------------------------------ Setup -----------------------------------

WORKDIR /var/www/adex
COPY build/static . 

RUN npm install -g http-server

#-------------------------------------- Run ------------------------------------

EXPOSE 800
CMD ["http-server"]
