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
import UniSwapRouterV2Abi from 'services/smart-contracts/abi/UniSwapRouterV2.json'
import UniSwapRouterV3Abi from 'services/smart-contracts/abi/UniSwapRouterV3.json'
import UniSwapQuoterV3Abi from 'services/smart-contracts/abi/UniSwapQuoterV3.json'

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
			// '0x10eB10Bf93BCd299542cEb1D5E5677ea1F6A41D7',
			'0xCfD55e2B9CdF3603c642d1047Ab2a6FEeb4e9861',
		abi: WalletZapperAbi,
	},
	UniSwapRouterV2: {
		address:
			process.env.UNISWAP_ROUTER_V2 ||
			'0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
		abi: UniSwapRouterV2Abi,
	},
	UniSwapRouterV3: {
		address:
			process.env.UNISWAP_ROUTER_V3 ||
			'0xE592427A0AEce92De3Edee1F18E0157C05861564',
		abi: UniSwapRouterV3Abi,
	},
	UniSwapQuoterV3: {
		address:
			process.env.UNISWAP_QUOTER_V3 ||
			'0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
		// Abi modified
		// https://twitter.com/dcfgod/status/1405608315011411970?s=20
		abi: UniSwapQuoterV3Abi,
	},
}
