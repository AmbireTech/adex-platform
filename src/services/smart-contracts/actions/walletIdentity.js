import { Contract, BigNumber, utils, constants } from 'ethers'
import { tokens, assets } from 'services/adex-wallet'
import { formatTokenAmount } from 'helpers/formatters'
import {
	getSigner,
	getMultipleTxSignatures,
} from 'services/smart-contracts/actions/ethers'
import { executeTx } from 'services/adex-relayer'
import ERC20TokenABI from 'services/smart-contracts/abi/ERC20Token'
import { selectRelayerConfig } from 'selectors'
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
	const { gasPriceRatio = 1.07, gasPriceCap } = selectRelayerConfig()
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

	const networkGasPrice = await provider.getGasPrice()

	const gasPrice = Math.min(
		gasPriceCap,
		Math.floor(networkGasPrice * gasPriceRatio)
	)

	const feeTokenAddrUSDPrice = prices[feeToken.symbol]['USD']

	const withNonceAndFees = txns.map((tx, txIndex) => {
		const { operationsGasLimits = [] } = tx
		// const feeToken = feeTokenWhitelist[tx.feeTokenAddr]
		const isDeployTx = currentNonce === 0
		const addFeeTx = txIndex === txns.length - 1

		const operationsGasLimitSumBN = operationsGasLimits.reduce(
			(a, b) => a.add(b),
			ZERO
		)

		const txEstimatedGasLimitBN = operationsGasLimitSumBN
			.add(isDeployTx ? GAS_LIMITS.deploy : ZERO)
			// Add fee transfer fee
			.add(addFeeTx ? GAS_LIMITS.transfer : ZERO)

		const calculatedOperationsCount =
			operationsGasLimits.length + (isDeployTx ? 1 : 0) + (addFeeTx ? 1 : 0)

		const txFeeAmountETH = parseFloat(
			formatUnits(
				txEstimatedGasLimitBN.mul(gasPrice),
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
			txEstimatedGasLimitBN,
			calculatedGasPriceBN: gasPrice,
			calculatedOperationsCount,
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

	const {
		totalFeesBN,
		txnsCount,
		hasDeployTx,
		totalEstimatedGasLimitBN,
		calculatedGasPriceBN,
		calculatedOperationsCount,
	} = txnsWithNonceAndFees.reduce(
		(result, tx) => {
			const {
				feeAmount,
				isDeployTx,
				txEstimatedGasLimitBN,
				calculatedOperationsCount,
				calculatedGasPriceBN,
			} = tx

			const {
				totalFeesBN,
				txnsCount,
				hasDeployTx,
				totalEstimatedGasLimitBN,
			} = result
			result.totalFeesBN = totalFeesBN.add(feeAmount)
			result.txnsCount = txnsCount + 1
			result.hasDeployTx = hasDeployTx || isDeployTx
			result.totalEstimatedGasLimitBN = totalEstimatedGasLimitBN.add(
				txEstimatedGasLimitBN
			)
			// It's the same for all txns
			result.calculatedGasPriceBN =
				result.calculatedGasPriceBN || calculatedGasPriceBN
			result.calculatedOperationsCount =
				result.calculatedOperationsCount + calculatedOperationsCount

			return result
		},
		{
			hasDeployTx: false,
			totalFeesBN: ZERO,
			txnsCount: 0,
			totalEstimatedGasLimitBN: ZERO,
			calculatedGasPriceBN: null,
			calculatedOperationsCount: 0,
		}
	)

	console.log('calculatedGasPriceBN', calculatedGasPriceBN.toString())
	console.log(
		'calculatedGasPriceGWEI',
		formatUnits(calculatedGasPriceBN, 'gwei')
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
		totalEstimatedGasLimitBN,
		totalEstimatedGasLimitFormatted: totalEstimatedGasLimitBN.toString(),
		calculatedGasPriceBN,
		calculatedGasPriceGWEI: formatUnits(
			calculatedGasPriceBN.toString(),
			'gwei'
		),
		calculatedOperationsCount,
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
