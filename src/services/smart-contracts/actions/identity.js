import { getEthers } from 'services/smart-contracts/ethers'
import {
	getSigner,
	getMultipleTxSignatures,
} from 'services/smart-contracts/actions/ethers'
import { getSweepingTxnsIfNeeded } from 'services/smart-contracts/actions/core'
import { Contract } from 'ethers'
import {
	bigNumberify,
	parseUnits,
	getAddress,
	Interface,
	keccak256,
} from 'ethers/utils'
import { generateAddress2 } from 'ethereumjs-util'
import { executeTx } from 'services/adex-relayer'
import { selectRelayerConfig, selectFeeTokenWhitelist } from 'selectors'
import { formatTokenAmount } from 'helpers/formatters'
import { getProxyDeployBytecode } from 'adex-protocol-eth/js/IdentityProxyDeploy'

import solc from 'solcBrowser'
import { RoutineAuthorization } from 'adex-protocol-eth/js/Identity'

import ERC20TokenABI from 'services/smart-contracts/abi/ERC20Token'
import ScdMcdMigrationABI from 'services/smart-contracts/abi/ScdMcdMigration'

const ERC20 = new Interface(ERC20TokenABI)
const ScdMcdMigration = new Interface(ScdMcdMigrationABI)
const { SCD_MCD_MIGRATION_ADDR } = process.env

export async function getIdentityDeployData({
	owner,
	relayerRoutineAuthValidUntil = 10648454444,
}) {
	const {
		identityFactoryAddr,
		relayerAddr,
		baseIdentityAddr,
		identityRecoveryAddr,
		coreAddr,
		mainToken,
	} = selectRelayerConfig()

	const privileges = [[owner, 2], [identityRecoveryAddr, 2]]

	const routineAuthorizationsRaw = [
		{
			relayer: relayerAddr,
			outpace: coreAddr,
			validUntil: relayerRoutineAuthValidUntil,
			feeTokenAddr: mainToken.address,
			feeTokenAmount: '0x00',
		},
	]

	const bytecode = getProxyDeployBytecode(
		baseIdentityAddr,
		privileges,
		{
			privSlot: 0,
			routineAuthsSlot: 1,
			routineAuthorizations: routineAuthorizationsRaw.map(x =>
				new RoutineAuthorization(x).hash()
			),
		},
		solc
	)

	const salt = keccak256(owner)

	const identityAddr = getAddress(
		`0x${generateAddress2(identityFactoryAddr, salt, bytecode).toString('hex')}`
	)

	return {
		identityFactoryAddr,
		baseIdentityAddr,
		bytecode,
		salt,
		identityAddr,
		privileges,
		routineAuthorizationsRaw,
	}
}

export async function withdrawFromIdentity({
	account,
	amountToWithdraw,
	withdrawTo,
	getFeesOnly,
	tokenAddress,
}) {
	const toWithdraw = parseUnits(amountToWithdraw, 18)
	const sweepTxns = await getSweepingTxnsIfNeeded({
		amountNeeded: toWithdraw,
		account,
	})

	const { wallet, identity } = account
	const { provider, MainToken, Identity } = await getEthers(wallet.authType)
	const identityAddr = identity.address
	// TEMP HOTFIX
	// TODO: Make it work with multiple tokens
	const tokenAddr = tokenAddress || MainToken.address

	const tx1 = {
		identityContract: identityAddr,
		feeTokenAddr: tokenAddr,
		to: tokenAddr,
		data: ERC20.functions.transfer.encode([withdrawTo, toWithdraw]),
	}
	const txns = [...sweepTxns, tx1]

	const txnsByFeeToken = await getIdentityTxnsWithNoncesAndFees({
		txns,
		identityAddr,
		provider,
		Identity,
	})

	if (getFeesOnly) {
		return {
			fees: (await getIdentityTxnsTotalFees(txnsByFeeToken)).total,
			toGet: formatTokenAmount(toWithdraw, 18),
		}
	}

	const result = await processExecuteByFeeTokens({
		identityAddr,
		txnsByFeeToken,
		wallet,
		provider,
	})

	return {
		result,
	}
}

export async function setIdentityPrivilege({
	account,
	setAddr,
	privLevel,
	getFeesOnly,
}) {
	const { wallet, identity } = account
	const { provider, MainToken, Identity } = await getEthers(wallet.authType)
	const identityAddr = identity.address

	const identityInterface = new Interface(Identity.abi)

	const tx1 = {
		identityContract: identityAddr,
		feeTokenAddr: MainToken.address,
		to: identityAddr,
		data: identityInterface.functions.setAddrPrivilege.encode([
			setAddr,
			privLevel,
		]),
	}

	const txns = [tx1]
	const txnsByFeeToken = await getIdentityTxnsWithNoncesAndFees({
		txns,
		identityAddr,
		provider,
		Identity,
	})

	if (getFeesOnly) {
		return {
			fees: (await getIdentityTxnsTotalFees(txnsByFeeToken)).total,
		}
	}

	const result = await processExecuteByFeeTokens({
		txnsByFeeToken,
		identityAddr,
		wallet,
		provider,
		extraData: {
			setAddr,
			privLevel,
		},
	})

	return {
		result,
	}
}

export async function getIdentityTxnsWithNoncesAndFees({
	txns = [],
	identityAddr,
	provider,
	Identity,
}) {
	const feeTokenWhitelist = selectFeeTokenWhitelist()
	const { mainToken, daiAddr, saiAddr } = selectRelayerConfig()

	let isDeployed = (await provider.getCode(identityAddr)) !== '0x'
	let identityContract = null

	if (isDeployed) {
		identityContract = new Contract(identityAddr, Identity.abi, provider)
	}

	const initialNonce = isDeployed
		? (await identityContract.nonce()).toNumber()
		: 0

	const { txnsByFeeToken, saiWithdrawAmount } = txns.reduce(
		(current, tx, i) => {
			const { withdrawAmount } = tx

			const needSaiToDaiSwap =
				withdrawAmount &&
				tx.feeTokenAddr === saiAddr &&
				mainToken === daiAddr &&
				saiAddr !== daiAddr

			let feeTokenAddr = ''

			if (needSaiToDaiSwap) {
				current.saiWithdrawAmount = current.saiWithdrawAmount.add(
					bigNumberify(withdrawAmount)
				)
				feeTokenAddr = daiAddr
			}

			feeTokenAddr = feeTokenAddr || tx.feeTokenAddr || mainToken.address
			// normalize tx
			tx.feeTokenAddr = feeTokenAddr
			tx.identityContract = (tx.identityContract || identityAddr).toLowerCase()

			current.txnsByFeeToken[feeTokenAddr] = (
				current.txnsByFeeToken[feeTokenAddr] || []
			).concat([tx])

			return current
		},
		{
			saiWithdrawAmount: bigNumberify('0'),
			txnsByFeeToken: {},
		}
	)

	if (!saiWithdrawAmount.isZero()) {
		txnsByFeeToken[daiAddr].concat(
			swapSaiToDaiTxns({
				identityAddr,
				daiAddr,
				saiAddr,
				withdrawAmount: saiWithdrawAmount.toString(),
			})
		)
	}

	let currentNonce = initialNonce

	Object.keys(txnsByFeeToken).forEach(key => {
		txnsByFeeToken[key] = txnsByFeeToken[key].map(tx => {
			const feeToken = feeTokenWhitelist[tx.feeTokenAddr]
			const feeAmount = currentNonce === 0 ? feeToken.minDeploy : feeToken.min

			const txWithNonce = {
				...tx,
				feeTokenAddr: feeToken.address,
				feeAmount,
				nonce: currentNonce,
			}

			currentNonce += 1

			return txWithNonce
		})
	})

	return txnsByFeeToken
}

function swapSaiToDaiTxns({ identityAddr, daiAddr, saiAddr, withdrawAmount }) {
	const approveTx = {
		identityContract: identityAddr,
		feeTokenAddr: daiAddr,
		to: saiAddr,
		data: ERC20.functions.approve.encode([
			SCD_MCD_MIGRATION_ADDR,
			withdrawAmount,
		]),
	}

	const swapTx = {
		identityContract: identityAddr,
		feeTokenAddr: daiAddr,
		to: SCD_MCD_MIGRATION_ADDR,
		data: ScdMcdMigration.functions.swapSaiToDai.encode([withdrawAmount]),
	}

	return [approveTx, swapTx]
}

// TODO: use byToken where needed
// currently works because only using SAI and DAI only
export async function getIdentityTxnsTotalFees(txnsByFeeToken) {
	const feeTokenWhitelist = selectFeeTokenWhitelist()
	const bigZero = bigNumberify('0')
	const feesData = Object.values(txnsByFeeToken)
		.reduce((all, byFeeToken) => all.concat(byFeeToken), [])
		.reduce(
			(result, tx) => {
				const txFeeAmount = bigNumberify(tx.feeAmount)
				result.total = result.total.add(txFeeAmount)

				result.byToken[tx.feeTokenAddr] = (
					result.byToken[tx.feeTokenAddr] || bigZero
				).add(txFeeAmount)

				return result
			},
			{ total: bigZero, byToken: {} }
		)

	const byToken = Object.entries(feesData.byToken).map(([key, value]) => {
		const { decimals, symbol } = feeTokenWhitelist[key]
		return {
			address: key,
			fee: formatTokenAmount(value.toString(), decimals),
			symbol,
			feeFormatted: `${formatTokenAmount(
				value.toString(),
				decimals,
				false,
				4
			)} ${symbol}`,
		}
	})

	const fees = {
		total: formatTokenAmount(feesData.total.toString(), 18),
		byToken,
	}

	return fees
}

export async function getIdentityBalance({ identityAddr, authType }) {
	const { Dai } = await getEthers(authType)
	const balance = await Dai.balanceOf(identityAddr)

	return balance.toString()
}

export async function processExecuteByFeeTokens({
	txnsByFeeToken,
	wallet,
	provider,
	identityAddr,
	extraData = {},
}) {
	const signer = await getSigner({ wallet, provider })
	const all = Object.values(txnsByFeeToken).map(async txnsRaw => {
		const signatures = await getMultipleTxSignatures({ txns: txnsRaw, signer })
		const data = {
			txnsRaw,
			signatures,
			identityAddr,
			...extraData,
		}

		const result = await executeTx(data)

		return {
			result,
		}
	})

	const results = await Promise.all(all)

	return results
}
