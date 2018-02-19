/* NOTE: Localhost config - works wit EthereumJS TestRPC v4.1.3 (ganache-core: 1.1.3)
 * sudo npm install -g ethereumjs-testrpc@4.1.3
 * adex-core yarn test (just exchange) (created contracts 2-token, 3-registry, 4-exchange)
 * acc (0) - 100ETH, 100 000 000 ADX
*/
// ropsten
export const testrpcCfg = {
    node: 'https://ropsten.infura.io/TFyhO35Dd1LC2OVKanBJ',
    addr: {
        token: '0xD06632e3916776e781d66A7A08ffBb77271742F7',
        exchange: '0x6387622BD50fDDDA242384e34CF4CD45F535a2eF',
    }
}