import Identity from './build/Identity.json'
import AdExCore from './build/AdExCore.json'
import Dai from './build/Dai.json'
import IdentityFactory from './build/IdentityFactory.json'

export const contracts = {
	Identity: {
		abi: Identity.abi,
	},
	AdExCore: {
		address: process.env.ADEX_CORE_ADDR,
		abi: AdExCore.abi,
	},
	DAI: {
		address: process.env.DAI_TOKEN_ADDR,
		abi: Dai.abi,
		decimals: 18,
	},
	IdentityFactory: {
		address: process.env.IDENTITY_FACTORY_ADDR,
		abi: IdentityFactory.abi,
	},
}
