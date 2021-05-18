import Identity from './build/Identity.json'
import AdExCore from './build/AdExCore.json'
import Dai from './build/Dai.json'
import IdentityFactory from './build/IdentityFactory.json'
import AdExENSManager from './abi/AdExENSManager.json'
import ReverseRegistrar from './abi/ReverseRegistrar.json'
import ERC20 from './abi/ERC20Token.json'
import ADXLoyaltyPoolTokenABI from 'services/smart-contracts/abi/ADXLoyaltyPoolTokenABI.json'
import StakingPoolABI from 'services/smart-contracts/abi/StakingPool.json'
import WalletZapperAbi from 'services/smart-contracts/abi/Zapper.json'

export const contracts = {
	Identity: {
		abi: Identity.abi,
	},
	AdExENSManager: {
		address: process.env.ADEX_ENS_ADDR,
		publicResolver: process.env.REVERSE_REGISTRAR_PUBLIC_RESOLVER,
		abi: AdExENSManager,
	},
	ReverseRegistrar: {
		address: process.env.REVERSE_REGISTRAR_ADDR,
		parentDomain: process.env.REVERSE_REGISTRAR_PARENT,
		abi: ReverseRegistrar,
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
	ERC20: {
		abi: ERC20,
	},
	ADXLoyaltyPoolToken: {
		address: process.env.ADDR_ADX_LOYALTY_POOL_TOKEN_ADDR,
		abi: ADXLoyaltyPoolTokenABI,
		decimalsMultiplier: 1e18,
		symbol: 'ADX-LOYALTY',
		decimals: 18,
	},
	ADXToken: {
		address: process.env.ADX_TOKEN_ADDR,
		abi: ERC20,
		symbol: 'ADX',
		decimals: 18,
	},
	StakingPool: {
		address: process.env.ADDR_ADX_STAKING_POOL_TOKEN_ADDR,
		abi: StakingPoolABI,
		decimalsMultiplier: 1e18,
		symbol: 'ADX-STAKING',
		decimals: 18,
	},
	WalletZapper: {
		address:
			process.env.ADDR_WALLET_ZAPPER ||
			'0xA6CC4cf51B4246A0e61cA105A8EFfad1b76eBF8A',
		abi: WalletZapperAbi,
	},
}
