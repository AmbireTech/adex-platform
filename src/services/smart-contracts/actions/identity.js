import { getEthers } from 'services/smart-contracts/ethers'
import {
	getSigner,
	prepareTx,
	processTx,
	getMultipleTxSignatures,
} from 'services/smart-contracts/actions/ethers'
import { getSweepingTxnsIfNeeded } from 'services/smart-contracts/actions/core'
import { ethers, Contract } from 'ethers'
import {
	bigNumberify,
	parseUnits,
	getAddress,
	Interface,
	keccak256,
} from 'ethers/utils'
import { generateAddress2 } from 'ethereumjs-util'
import { executeTx } from 'services/adex-relayer'
import { selectRelayerConfig } from 'selectors'
import { formatTokenAmount } from 'helpers/formatters'
import { contracts } from '../contractsCfg'
import { getProxyDeployBytecode } from 'adex-protocol-eth/js/IdentityProxyDeploy'

import solc from 'solcBrowser'
import { RoutineAuthorization } from 'adex-protocol-eth/js/Identity'

const { DAI } = contracts

const feeAmountTransfer = '150000000000000000'
const feeAmountSetPrivileges = '150000000000000000'
const ERC20 = new Interface(DAI.abi)

export async function getIdentityDeployData({
	owner,
	privLevel,
	addReleyerRoutinesAuth,
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

export function getPrivileges({ walletAddr, identityAddr, walletAuthType }) {
	return getEthers(walletAuthType).then(({ provider, Identity }) => {
		const contract = new ethers.Contract(identityAddr, Identity.abi, provider)
		return contract.privileges(walletAddr)
	})
}

export async function sendDaiToIdentity({
	account,
	amountToSend,
	// gas,
	estimateGasOnly,
}) {
	const { wallet, identity } = account
	const { provider, Dai } = await getEthers(wallet.authType)
	const signer = await getSigner({ wallet, provider })
	const daiWithSigner = Dai.connect(signer)
	const tokenAmount = parseUnits(amountToSend, 18).toString()

	const pTx = await prepareTx({
		tx: Dai.transfer(identity.address, tokenAmount),
		provider,
		// gasLimit,
		sender: wallet.address,
	})

	if (estimateGasOnly) {
		return pTx.gasLimit
	}

	processTx({
		tx: daiWithSigner.transfer(identity.address, tokenAmount, pTx),
		txSuccessData: { txMethod: 'TX_SEND_DAI_TO_IDENTITY' },
		from: wallet.address,
		fromType: 'wallet',
		account,
	})

	return {}
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
	const sweepFees = sweepTxns.reduce(
		(total, tx) => total.add(bigNumberify(tx.feeAmount)),
		bigNumberify(0)
	)
	const fees = bigNumberify(feeAmountTransfer).add(sweepFees)
	const tokenAmount = toWithdraw.sub(fees).toString()

	if (getFeesOnly) {
		return {
			fees: formatTokenAmount(fees.toString(), 18),
			toGet: formatTokenAmount(tokenAmount, 18),
		}
	}

	const { wallet, identity } = account
	const { provider, Dai, Identity } = await getEthers(wallet.authType)
	const signer = await getSigner({ wallet, provider })
	const identityAddr = identity.address
	// TEMP HOTFIX
	// TODO: Make it work with multiple tokens
	const tokenAddr = tokenAddress || Dai.address

	const tx1 = {
		identityContract: identityAddr,
		feeTokenAddr: tokenAddr,
		feeAmount: feeAmountTransfer,
		to: tokenAddr,
		data: ERC20.functions.transfer.encode([withdrawTo, tokenAmount]),
	}
	const txns = [...sweepTxns, tx1]

	const txnsRaw = await getIdentityTnxsWithNonces({
		txns,
		identityAddr,
		provider,
		Identity,
	})

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
	const fees = bigNumberify(feeAmountSetPrivileges)

	if (getFeesOnly) {
		return {
			fees: formatTokenAmount(fees.toString(), 18),
		}
	}

	const { wallet, identity } = account
	const { provider, Dai, Identity } = await getEthers(wallet.authType)
	const signer = await getSigner({ wallet, provider })
	const identityAddr = identity.address

	const identityInterface = new Interface(Identity.abi)

	const tx1 = {
		identityContract: identityAddr,
		feeTokenAddr: Dai.address,
		feeAmount: feeAmountSetPrivileges,
		to: identityAddr,
		data: identityInterface.functions.setAddrPrivilege.encode([
			setAddr,
			privLevel,
		]),
	}

	const txns = [tx1]
	const txnsRaw = await getIdentityTnxsWithNonces({
		txns,
		identityAddr,
		provider,
		Identity,
	})

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

export async function getIdentityTnxsWithNonces({
	txns = [],
	identityAddr,
	provider,
	Identity,
}) {
	const identityContract = new Contract(identityAddr, Identity.abi, provider)
	const initialNonce = (await identityContract.nonce()).toNumber()
	const withNonce = txns.map((tx, i) => {
		return {
			...tx,
			nonce: initialNonce + i,
		}
	})

	return withNonce
}

export async function getIdentityBalance({ identityAddr, authType }) {
	const { Dai } = await getEthers(authType)
	const balance = await Dai.balanceOf(identityAddr)

	return balance.toString()
}
