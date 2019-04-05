import Identity from './build/Identity.json'
import AdExCore from './build/AdExCore.json'
import Dai from './build/Dai.json'
import Tst from './build/Tst.json'
import IdentityFactory from './build/IdentityFactory.json'

const production = process.env.NODE_ENV === 'production'

export const contracts = {
	Identity: {
		abi: Identity.abi
	},
	AdExCore: {
		address: process.env.ADEX_CORE_ADDR || '0x333420fc6a897356e69b62417cd17ff012177d2b',
		abi: AdExCore.abi
	},
	DAI: {
		address: production
			? '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359'
			: '0x7af963cF6D228E564e2A0aA0DdBF06210B38615D', // goerli TST
		abi: production
			? Dai.abi
			:Tst.abi,
		decimals: 18
	},
	IdentityFactory: {
		address: process.env.IDENTITY_FACTORY_ADDR,
		abi: IdentityFactory.abi
	}
}
