import { assetsKovan } from './assets-kovan'
import { assetsMainnet } from './assets-mainnet'

export const { assets, tokens, mappers, getLogo } =
	process.env.NODE_ENV === 'production' ? assetsMainnet : assetsKovan
