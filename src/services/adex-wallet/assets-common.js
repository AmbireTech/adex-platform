import { getEthersReadOnly } from 'services/smart-contracts/ethers'
import { Contract, BigNumber } from 'ethers'
import { contracts } from 'services/smart-contracts/contractsCfg.js'
// import ADX_LOGO from 'resources/token-logos/ADX.png'
// import WETH_LOGO from 'resources/token-logos/WETH.png'
// import WBTC_LOGO from 'resources/token-logos/WBTC.png'
// import USDT_LOGO from 'resources/token-logos/USDT.png'
// import USDC_LOGO from 'resources/token-logos/USDC.png'
// import WBTC_LOGO from 'resources/token-logos/WBTC.png'
// import ETH_LOGO from 'resources/token-logos/ETH.png'
// import WETH_LOGO from 'resources/token-logos/WETH.png'
// import ADX_WALLET_LOGO from 'resources/wallet/logo.png'
// import UNI_LOGO from 'resources/token-logos/UNI.png'
// import DAI_LOGO from 'resources/token-logos/DAI.svg'
// import LINK_LOGO from 'resources/token-logos/LINK.png'
// import BTC_LOGO from 'resources/token-logos/BTC.png'
const { ADXLoyaltyPoolToken, StakingPool, ADXToken, ERC20 } = contracts

export const getERC20Token = (provider, address) => {
	const token = new Contract(address, ERC20.abi, provider)

	return token
}

export const getERC20Balance = async ({ tokenAddress, address }) => {
	const { provider } = await getEthersReadOnly()
	const token = getERC20Token(provider, tokenAddress)
	const balance = await token.balanceOf(address)

	return balance
}

export const getETHBalance = async ({ address }) => {
	const { provider } = await getEthersReadOnly()
	const balance = await provider.getBalance(address)

	return balance
}

export const getAdxToken = provider => {
	const adxToken = new Contract(ADXToken.address, ADXToken.abi, provider)

	return adxToken
}

export const getADXLoyaltyPoolToken = provider => {
	const adxLoyalty = new Contract(
		ADXLoyaltyPoolToken.address,
		ADXLoyaltyPoolToken.abi,
		provider
	)

	return adxLoyalty
}

export const getADXStakingPoolToken = provider => {
	const adxStakingPool = new Contract(
		StakingPool.address,
		StakingPool.abi,
		provider
	)

	return adxStakingPool
}

export async function mapWrappedETH(baseTokenSymbol, aTokenAmount) {
	return [baseTokenSymbol, aTokenAmount]
}

export async function mapAAVEInterestToken(baseTokenSymbol, aTokenAmount) {
	return [baseTokenSymbol, aTokenAmount]
}

export async function mapADXLoyaltyPoolToken(loyaltyTokenAmount) {
	const { provider } = await getEthersReadOnly()
	const adexLoyaltyPoolToken = getADXLoyaltyPoolToken(provider)
	const [shareValue] = await Promise.all([adexLoyaltyPoolToken.shareValue()])
	const adxAmount = BigNumber.from(loyaltyTokenAmount)
		.mul(shareValue)
		.div(ADXLoyaltyPoolToken.decimalsMultiplier.toString())
	return [ADXToken.symbol, adxAmount]
}

export async function mapADXStakingPoolToken(stakingTokenAmount) {
	const { provider } = await getEthersReadOnly()
	const adexStakingPoolToken = getADXStakingPoolToken(provider)
	const [shareValue] = await Promise.all([adexStakingPoolToken.shareValue()])
	const adxAmount = BigNumber.from(stakingTokenAmount)
		.mul(shareValue)
		.div(StakingPool.decimalsMultiplier.toString())
	return [ADXToken.address, adxAmount]
}
