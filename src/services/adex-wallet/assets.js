import { assetsKovan } from './assets-kovan'
import { assetsMainnet } from './assets-mainnet'
import ADX_WALLET_LOGO from 'resources/wallet/logo.png'

export const ETH_TOKENS = ['ETH', 'WETH', 'aETH', 'aWETH']

export const { assets, tokens, mappers, logos } =
	process.env.NODE_ENV === 'production' ? assetsMainnet : assetsKovan

export const getLogo = addressOrSymbol => {
	return (
		logos[addressOrSymbol] ||
		logos[tokens[addressOrSymbol]] ||
		logos['a' + addressOrSymbol] ||
		logos[tokens['a' + addressOrSymbol]] ||
		ADX_WALLET_LOGO
	)
}
