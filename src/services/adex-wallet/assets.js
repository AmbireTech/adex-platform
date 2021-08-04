import { assetsKovan } from './assets-kovan'
import { assetsMainnet } from './assets-mainnet'
import ADX_WALLET_LOGO from 'resources/wallet/logo.png'

export const { assets, tokens, mappers, logos } =
	process.env.NODE_ENV === 'production' ? assetsMainnet : assetsKovan

export const getLogo = addressOrSymbol => {
	return (
		logos[addressOrSymbol] || logos[tokens[addressOrSymbol]] || ADX_WALLET_LOGO
	)
}
