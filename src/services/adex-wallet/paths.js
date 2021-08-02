import { kovanPathsData } from './paths-kovan'
import { mainnetPathsData } from './paths-mainnet'

export const { getPath, TICK_SPACINGS, FeeAmount, uniswapRouters } =
	process.env.NODE_ENV === 'production' ? mainnetPathsData : kovanPathsData
