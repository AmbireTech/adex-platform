import { Config as BtcConfig } from '@jelly-swap/bitcoin'
import { Config as Erc20Config } from '@jelly-swap/erc20'

export const BTC_CONFIG = () => {
	const SWAP_EXPIRATION_TIME = 86400 // 1 DAY

	return {
		...BtcConfig(SWAP_EXPIRATION_TIME),
		receiverAddress: 'LIQUIDITY_PROVIDER_ADDRESS',
		providerUrl: 'https://spacejelly.network/btc/api/v1/btc/',
	}
}

export const DAI_CONFIG = () => {
	const TokenConfig = {
		DAI: {
			network: 'DAI',
			decimals: 18,
			address: '0x6b175474e89094c44da98b954eedeac495271d0f',
		},
	}

	const AddressToToken = {
		'0x6b175474e89094c44da98b954eedeac495271d0f': TokenConfig.DAI,
	}

	return {
		...Erc20Config('DAI', TokenConfig, AddressToToken),
		receiverAddress: 'LIQUIDITY_PROVIDER_ADDRESS',
		providerUrl: 'INFURA_URL',
	}
}
