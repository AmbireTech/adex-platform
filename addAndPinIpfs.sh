#!/usr/bin/env bash
cd /home/data/adex-dapp
export IPFS_PATH=/var/ipfs
ipfs pin add -r $(ipfs add -r build 2> /dev/null | tail -n1 | cut -f2 -d " ")
