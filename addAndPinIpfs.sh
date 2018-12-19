#!/usr/bin/env bash
cd /home/data/adex-dapp
/snap/bin/ipfs pin add -r $(/snap/bin/ipfs add -r build 2> /dev/null | tail -n1 | cut -f2 -d " ")
