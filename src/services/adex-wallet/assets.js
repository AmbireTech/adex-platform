import { kovan } from './assets-kovan'
import { ethereum } from './assets-mainnet'
import { polygon } from './assets-polygon'
import ADX_WALLET_LOGO from 'resources/wallet/logo.png'
import { selectNetwork } from 'selectors'

const assetByNetwork = {
	kovan,
	ethereum,
	polygon,
}

const getAssetsData = prop => {
	const { id = 'ethereum' } = selectNetwork()
	return assetByNetwork[id][prop]
}

export const ETH_TOKENS = ['ETH', 'WETH', 'aETH', 'aWETH']

export function isETHBasedToken({ address }) {
	const assets = getAssets()
	const token = assets[address]
	return ETH_TOKENS.includes(token.symbol)
}

export const getAssets = () => getAssetsData('assets')
export const getTokens = () => getAssetsData('tokens')
export const getLogos = () => getAssetsData('logos')
export const getMappers = () => getAssetsData('mappers')

export const getLogo = addressOrSymbol => {
	const logos = getLogos()
	const tokens = getTokens()
	return (
		logos[addressOrSymbol] ||
		logos[tokens[addressOrSymbol]] ||
		logos['a' + addressOrSymbol] ||
		logos[tokens['a' + addressOrSymbol]] ||
		ADX_WALLET_LOGO
	)
}
