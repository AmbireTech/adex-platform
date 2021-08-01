import { Contract, BigNumber, utils, constants } from 'ethers'
import { tokens, assets } from 'services/adex-wallet'
import { formatTokenAmount } from 'helpers/formatters'
import {
	getSigner,
	getMultipleTxSignatures,
} from 'services/smart-contracts/actions/ethers'
import { executeTx } from 'services/adex-relayer'
import ERC20TokenABI from 'services/smart-contracts/abi/ERC20Token'
const { parseUnits, formatUnits, Interface } = utils
const { MaxInt256 } = constants

const ERC20 = new Interface(ERC20TokenABI)

const ZERO = BigNumber.from('0')

export const GAS_LIMITS = {
	transfer: BigNumber.from(50_000), // to identity, to relayer (fee transfer), withdraw
	swapV2: BigNumber.from(110_000), // each
	swapV3: BigNumber.from(110_000), // each
	wrap: BigNumber.from(180_000), // each
	unwrap: BigNumber.from(180_000), // each
	deploy: BigNumber.from(120_000),
	base: BigNumber.from(30_000), // Base for each identity tx
	approve: BigNumber.from(70_000),
}

// Calc nonces and
export async function getWalletIdentityTxnsWithNoncesAndFees({
	txns = [],
	identityAddr,
	provider,
	Identity,
	account,
	feeTokenAddr,
}) {
	const allSameFeeToken = txns.every(x => x.feeTokenAddr === feeTokenAddr)

	if (!allSameFeeToken) {
		throw new Error('TXNS_FEES_NOT_SAME_FEE_TOKEN')
	}

	let isDeployed = (await provider.getCode(identityAddr)) !== '0x'
	let identityContract = null

	if (isDeployed) {
		identityContract = new Contract(identityAddr, Identity.abi, provider)
	}

	const initialNonce = isDeployed
		? (await identityContract.nonce()).toNumber()
		: 0

	let currentNonce = initialNonce
	const feeToken = assets[feeTokenAddr]

	// TODO: move it from account
	const { prices } = account.stats

	const gasPrice = await provider.getGasPrice()
	const feeTokenAddrUSDPrice = prices[feeToken.symbol]['USD']

	const withNonceAndFees = txns.map((tx, txIndex) => {
		const { operationsGasLimits = [] } = tx
		// const feeToken = feeTokenWhitelist[tx.feeTokenAddr]
		const isDeployTx = currentNonce === 0

		const operationsGasLimitSum = operationsGasLimits.reduce(
			(a, b) => a.add(b),
			ZERO
		)

		const txEstimatedGasLimit = operationsGasLimitSum
			.add(isDeployTx ? GAS_LIMITS.deploy : ZERO)
			// Add fee transfer fee
			.add(txIndex === txns.length - 1 ? GAS_LIMITS.transfer : ZERO)

		const txFeeAmountETH = parseFloat(
			formatUnits(
				txEstimatedGasLimit.mul(gasPrice),
				assets[tokens['WETH']].decimals
			)
		)

		// TODO: BN
		const txFeeAmountUSD = txFeeAmountETH * prices['WETH']['USD']
		const txFeeAmountFeeToken = parseUnits(
			(txFeeAmountUSD / feeTokenAddrUSDPrice).toFixed(feeToken.decimals),
			feeToken.decimals
		)

		// Total relayer fees for the transaction
		const feeAmount = txFeeAmountFeeToken.toString()

		const txWithNonce = {
			...tx,
			feeTokenAddr,
			feeAmount,
			isDeployTx,
			nonce: currentNonce,
		}

		currentNonce += 1

		return txWithNonce
	})

	return withNonceAndFees
}

export async function getWalletIdentityTxnsTotalFees({ txnsWithNonceAndFees }) {
	const { feeTokenAddr } = txnsWithNonceAndFees[0]
	const feeToken = assets[feeTokenAddr]

	const { totalFeesBN, txnsCount, hasDeployTx } = txnsWithNonceAndFees.reduce(
		(result, tx) => {
			const { feeAmount, isDeployTx } = tx

			const { totalFeesBN, txnsCount, hasDeployTx } = result
			result.totalFeesBN = totalFeesBN.add(feeAmount)
			result.txnsCount = txnsCount + 1
			result.hasDeployTx = hasDeployTx || isDeployTx

			return result
		},
		{
			hasDeployTx: false,
			totalFeesBN: ZERO,
			txnsCount: 0,
		}
	)

	const actionMinAmountBN = totalFeesBN.mul(2)

	const fees = {
		totalFeesFormatted: formatTokenAmount(
			totalFeesBN,
			feeToken.decimals,
			false,
			feeToken.decimals
		),
		totalFeesBN,
		txnsCount,
		hasDeployTx,
		feeTokenAddr,
		feeTokenSymbol: feeToken.symbol,
		feeTokenDecimals: feeToken.decimals,
		actionMinAmountBN,
		actionMinAmountFormatted: formatTokenAmount(
			actionMinAmountBN,
			feeToken.decimals,
			false,
			feeToken.decimals
		),
	}

	return fees
}

export async function processExecuteWalletTxns({
	txnsWithNonceAndFees,
	wallet,
	provider,
	identityAddr,
	extraData = {},
}) {
	const signer = await getSigner({ wallet, provider })
	const signatures = await getMultipleTxSignatures({
		txns: txnsWithNonceAndFees,
		signer,
	})
	const data = {
		txnsRaw: txnsWithNonceAndFees,
		signatures,
		identityAddr,
		...extraData,
	}

	if (
		process.env.BUILD_TYPE === 'staging' ||
		process.env.NODE_ENV === 'development'
	) {
		console.log('data', JSON.stringify(data, null, 2))
	}

	const result = await executeTx(data)

	return {
		result,
	}
}

export async function getWalletApproveTxns({
	provider,
	tokenAddress,
	identityAddr,
	feeTokenAddr,
	approveForAddress,
	approveAmount = MaxInt256,
}) {
	const tokenContract = new Contract(tokenAddress, ERC20TokenABI, provider)

	const allowance = await tokenContract.allowance(
		identityAddr,
		approveForAddress
	)

	const approveTxns = []

	if (!allowance.isZero()) {
		approveTxns.push({
			identityContract: identityAddr,
			feeTokenAddr,
			to: tokenAddress,
			data: ERC20.encodeFunctionData('approve', [approveForAddress, 0]),
			operationsGasLimits: [GAS_LIMITS.approve],
		})
	}

	approveTxns.push({
		identityContract: identityAddr,
		feeTokenAddr,
		to: tokenAddress,
		data: ERC20.encodeFunctionData('approve', [
			approveForAddress,
			approveAmount,
		]),
		operationsGasLimits: [GAS_LIMITS.approve],
	})

	return approveTxns
}
