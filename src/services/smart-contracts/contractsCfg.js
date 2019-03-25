import Identity from './build/Identity.json'
import AdExCore from './build/AdExCore.json'
import Dai from './build/Dai.json'

const production = process.env.NODE_ENV === 'production'

export const contracts = {
	Identity: {
		abi: Identity.abi,
		bytecode: Identity.bytecode
	},
	AdExCore: {
		address: process.env.ADEX_CORE_ADDR || '0x333420fc6a897356e69b62417cd17ff012177d2b',
		abi: AdExCore.abi,
		bytecode: AdExCore.bytecode
	},
	DAI: {
		address: production
			? '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359'
			: '0xC4375B7De8af5a38a93548eb8453a498222C4fF2',
		abi: Dai.abi,
		decimals: 18
	}
}
