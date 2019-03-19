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
		exchange: '0x6387622bd50fddda242384e34cf4cd45f535a2ef',
	}
}

export const kovanCfg = {
	node: 'https://kovan.infura.io/v3/3d22938fd7dd41b7af4197752f83e8a1',
	addr: {
		token: '0xC4375B7De8af5a38a93548eb8453a498222C4fF2',
		exchange: '',
		core: '0xe6AA464334A067F52E44F7B6dAbB91804371376C'
	}
}