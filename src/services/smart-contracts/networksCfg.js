const INFURA_ID = process.env.INFURA_ID

export const networks = {
	Mainnet: {
		name: 'Mainnet',
		nodes: [
			{
				name: process.env.WEB3_NODE_NAME || 'infura.io',
				addr: process.env.WEB3_NODE_ADDR || 'https://mainnet.infura.io/v3/' + INFURA_ID
			}
		]
	},
	Kovan: {
		name: 'Kovan',
		nodes: [
			{
				name: 'infura.io',
				addr: 'https://kovan.infura.io/v3/' + INFURA_ID
			}
		]
	},
	Goerli: {
		name: 'Goerli',
		nodes: [
			{
				name: 'infura.io',
				addr: 'https://goerli.infura.io/v3/' + INFURA_ID
			}
		]
	}
}
