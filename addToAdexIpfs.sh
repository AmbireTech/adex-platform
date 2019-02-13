#!/usr/bin/env bash
USERNAME=$1
HOSTNAME=$2
SCRIPT='/home/data/adex-dapp/addAndPinIpfs.sh'

npm run-script build

rsync -av ./build ${USERNAME}@${HOSTNAME}:/home/data/adex-dapp
rsync -av ./addAndPinIpfs.sh ${USERNAME}@${HOSTNAME}:/home/data/adex-dapp

ssh -l ${USERNAME} ${HOSTNAME} "${SCRIPT}"
