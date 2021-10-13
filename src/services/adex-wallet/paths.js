import { kovanPathsData } from './paths-kovan'
import { mainnetPathsData } from './paths-mainnet'
import { polygonPathsData } from './paths-polygon'
import { selectNetwork } from 'selectors'

const pathsByNetwork = {
	kovan: kovanPathsData,
	ethereum: mainnetPathsData,
	polygon: polygonPathsData,
}

export const getPath = args => {
	const { id } = selectNetwork()
	if (!id) {
		throw new Error('getPath - network id not provided')
	}
	const getPathFn = pathsByNetwork[id].getPath
	return getPathFn(args)
}

export const {
	//  getPath,
	TICK_SPACINGS,
	FeeAmount,
	uniswapRouters,
} = process.env.NODE_ENV === 'production' ? mainnetPathsData : kovanPathsData
