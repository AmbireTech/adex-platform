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
import { selectRelayerConfig, selectMainFeeToken } from 'selectors'
import { formatTokenAmount } from 'helpers/formatters'
import { getProxyDeployBytecode } from 'adex-protocol-eth/js/IdentityProxyDeploy'

import solc from 'solcBrowser'
import { RoutineAuthorization } from 'adex-protocol-eth/js/Identity'

import ERC20TokenABI from 'services/smart-contracts/abi/ERC20Token'

const ERC20 = new Interface(ERC20TokenABI)

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
	const { provider, Dai, Identity } = await getEthers(wallet.authType)
	const identityAddr = identity.address
	// TEMP HOTFIX
	// TODO: Make it work with multiple tokens
	const tokenAddr = tokenAddress || Dai.address

	const tx1 = {
		identityContract: identityAddr,
		feeTokenAddr: tokenAddr,
		to: tokenAddr,
		data: ERC20.functions.transfer.encode([withdrawTo, toWithdraw]),
	}
	const txns = [...sweepTxns, tx1]

	const txnsRaw = await getIdentityTxnsWithNoncesAndFees({
		txns,
		identityAddr,
		provider,
		Identity,
	})

	if (getFeesOnly) {
		return {
			fees: await getIdentityTxnsTotalFees(txnsRaw),
			toGet: formatTokenAmount(toWithdraw, 18),
		}
	}

	const signer = await getSigner({ wallet, provider })
	const signatures = await getMultipleTxSignatures({ txns: txnsRaw, signer })

	const data = {
		txnsRaw,
		signatures,
		identityAddr,
	}

	const result = await executeTx(data)

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
	const { provider, Dai, Identity } = await getEthers(wallet.authType)
	const identityAddr = identity.address

	const identityInterface = new Interface(Identity.abi)

	const tx1 = {
		identityContract: identityAddr,
		feeTokenAddr: Dai.address,
		to: identityAddr,
		data: identityInterface.functions.setAddrPrivilege.encode([
			setAddr,
			privLevel,
		]),
	}

	const txns = [tx1]
	const txnsRaw = await getIdentityTxnsWithNoncesAndFees({
		txns,
		identityAddr,
		provider,
		Identity,
	})

	if (getFeesOnly) {
		return {
			fees: await getIdentityTxnsTotalFees(txnsRaw),
		}
	}

	const signer = await getSigner({ wallet, provider })
	const signatures = await getMultipleTxSignatures({ txns: txnsRaw, signer })

	const data = {
		txnsRaw,
		signatures,
		identityAddr,
		setAddr,
		privLevel,
	}

	const result = await executeTx(data)

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
	let identityContract = null
	let isDeployed = (await provider.getCode(identityAddr)) !== '0x'

	if (isDeployed) {
		identityContract = new Contract(identityAddr, Identity.abi, provider)
	}
	const { min, minDeploy } = selectMainFeeToken()

	const initialNonce = isDeployed
		? (await identityContract.nonce()).toNumber()
		: 0
	const withNonce = txns.map((tx, i) => {
		const nonce = initialNonce + i
		const feeAmount = nonce === 0 ? minDeploy : min

		return {
			...tx,
			feeAmount,
			nonce,
		}
	})

	return withNonce
}

export async function getIdentityTxnsTotalFees(txns) {
	const fees = txns.reduce((sum, tx) => {
		return sum.add(bigNumberify(tx.feeAmount))
	}, bigNumberify('0'))

	return formatTokenAmount(fees.toString(), 18)
}

export async function getIdentityBalance({ identityAddr, authType }) {
	const { Dai } = await getEthers(authType)
	const balance = await Dai.balanceOf(identityAddr)

	return balance.toString()
}
