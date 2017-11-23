
# Node 6.x
FROM node:6

# Meta
MAINTAINER Ivo Paunov <paunov@strem.io>
LABEL Description="AdEx dapp" Vendor="Smart Code ltd" Version="0.0.0"

#------------------------------------ Setup -----------------------------------

WORKDIR /var/www/adex
COPY build . 

RUN npm install -g http-server

#-------------------------------------- Run ------------------------------------

EXPOSE 8080
CMD ["http-server"]
