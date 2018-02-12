start cmd.exe /k ipfs daemon
start cmd.exe /k ganache-cli
start cmd.exe /k "cd c:\git\adex-core && yarn test"
start ubuntu.exe /c redis-server
start code c:/git/adex-dapp & timeout 1 & code c:/git/adex-node & timeout 1 &  code c:/git/adex-models & timeout 1 &  code c:/git/adex-constants & timeout 1 & code c:/git/adex-translations