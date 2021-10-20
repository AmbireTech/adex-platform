import Identity from './build/Identity.json'
import AdExCore from './build/AdExCore.json'
import Dai from './build/Dai.json'
// import IdentityFactory from './build/IdentityFactory.json'
import AdExENSManager from './abi/AdExENSManager.json'
import IdentityPayable from './abi/IdentityPayable.json'
import IdentityFactory from './abi/IdentityFactory.json'
import ReverseRegistrar from './abi/ReverseRegistrar.json'
import ERC20 from './abi/ERC20Token.json'
import ADXLoyaltyPoolTokenABI from 'services/smart-contracts/abi/ADXLoyaltyPoolTokenABI.json'
import StakingPoolABI from 'services/smart-contracts/abi/StakingPool.json'
import WalletZapperAbi from 'services/smart-contracts/abi/Zapper.json'
import UniSwapRouterV2Abi from 'services/smart-contracts/abi/UniSwapRouterV2.json'
import UniSwapRouterV3Abi from 'services/smart-contracts/abi/UniSwapRouterV3.json'
import UniSwapQuoterV3Abi from 'services/smart-contracts/abi/UniSwapQuoterV3.json'
import AAVELendingPoolAbi from 'services/smart-contracts/abi/AAVELendingPool.json'
import WETHAbi from 'services/smart-contracts/abi/WETH.json'

export const contracts = {
	Identity: {
		abi: Identity.abi,
	},
	IdentityPayable: {
		abi: IdentityPayable,
	},
	AdExENSManager: {
		// address: process.env.ADEX_ENS_ADDR,
		publicResolver: process.env.REVERSE_REGISTRAR_PUBLIC_RESOLVER,
		abi: AdExENSManager,
	},
	ReverseRegistrar: {
		// address: process.env.REVERSE_REGISTRAR_ADDR,
		parentDomain: process.env.REVERSE_REGISTRAR_PARENT,
		abi: ReverseRegistrar,
	},
	AdExCore: {
		// address: process.env.ADEX_CORE_ADDR,
		abi: AdExCore.abi,
	},
	DAI: {
		// address: process.env.DAI_TOKEN_ADDR,
		abi: Dai.abi,
		decimals: 18,
	},
	IdentityFactory: {
		// address: process.env.IDENTITY_FACTORY_ADDR,
		abi: IdentityFactory,
	},
	ERC20: {
		abi: ERC20,
	},
	ADXLoyaltyPoolToken: {
		// TODO: get ti from contrcts cfb by network
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
		// address: process.env.ADDR_ADX_STAKING_POOL_TOKEN_ADDR,
		abi: StakingPoolABI,
		decimalsMultiplier: 1e18,
		symbol: 'ADX-STAKING',
		decimals: 18,
	},
	WalletZapper: {
		// address: process.env.ADDR_WALLET_ZAPPER,
		abi: WalletZapperAbi,
	},
	UniSwapRouterV2: {
		// address: process.env.UNISWAP_ROUTER_V2,
		abi: UniSwapRouterV2Abi,
	},
	UniSwapRouterV3: {
		// address: process.env.UNISWAP_ROUTER_V3,
		abi: UniSwapRouterV3Abi,
	},
	UniSwapQuoterV3: {
		// address: process.env.UNISWAP_QUOTER_V3,
		// Abi modified
		// https://twitter.com/dcfgod/status/1405608315011411970?s=20
		abi: UniSwapQuoterV3Abi,
	},
	AaveLendingPool: {
		// address: process.env.AAVE_LENDING_POOL_ADDR,
		abi: AAVELendingPoolAbi,
	},
	WETH: {
		// address: process.env.WETH_ADDR,
		abi: WETHAbi,
	},
}
