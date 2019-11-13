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
	// randomBytes,
	getAddress,
	hexlify,
	Interface,
	keccak256,
} from 'ethers/utils'
import { generateAddress2 } from 'ethereumjs-util'
import {
	// identityBytecode,
	executeTx,
	setAddrPriv,
	relayerConfig,
} from 'services/adex-relayer'
import { formatTokenAmount } from 'helpers/formatters'
import { contracts } from '../contractsCfg'
import { getProxyDeployBytecode } from 'adex-protocol-eth/js/IdentityProxyDeploy'
// import FactoryABI from 'adex-protocol-eth/abi/IdentityFactory'
// const Factory = new Interface(FactoryABI)

import solc from 'solcBrowser'
import { RoutineAuthorization } from 'adex-protocol-eth/js/Identity'

const { DAI } = contracts

const { IDENTITY_BASE_ADDR, IDENTITY_FACTORY_ADDR } = process.env

const GAS_LIMIT_DEPLOY_CONTRACT = 150000
const feeAmountTransfer = '150000000000000000'
const feeAmountSetPrivileges = '150000000000000000'
const ERC20 = new Interface(DAI.abi)
/*
export async function getIdentityBytecode({ owner, privLevel }) {
	const res = await identityBytecode({
		owner,
		privLevel,
		identityBaseAddr: IDENTITY_BASE_ADDR
	})
	return res.bytecode
}

export async function getIdentityDeployData({ owner, privLevel }) {
	const bytecode = await getIdentityBytecode({ owner, privLevel })
	const salt =
		`0x${Buffer.from(randomBytes(32)).toString('hex')}`
	const expectedAddr = getAddress(
		`0x${generateAddress2(IDENTITY_FACTORY_ADDR, salt, bytecode)
			.toString('hex')}`
	)

	return {
		bytecode,
		salt,
		expectedAddr
	}
}
*/

async function getRelayerRoutinesAuthAuth({
	relayer,
	outpace,
	registry,
	validUntil,
	feeTokenAddr,
	weeklyFeeAmount,
}) {
	const relayerAuth = new RoutineAuthorization({
		relayer,
		outpace,
		registry,
		validUntil,
		feeTokenAddr,
		weeklyFeeAmount,
	})

	return relayerAuth
}

export async function getIdentityBytecode({
	identityBaseAddr,
	routineAuthorizations,
	privileges = [],
}) {
	const opts = {
		privSlot: 0,
	}

	if (!!routineAuthorizations && routineAuthorizations.length) {
		opts.routineAuthsSlot = 1
		opts.routineAuthorizations = routineAuthorizations.map(a => a.hash())
	}

	const bytecode = getProxyDeployBytecode(
		identityBaseAddr,
		privileges,
		opts,
		solc
	)

	return bytecode
}

export async function getIdentityDeployData({
	owner,
	privLevel,
	addReleyerRoutinesAuth,
	relayerRoutineAuthValidUntil = 10648454444,
}) {
	const {
		identityFactoryAddr,
		registryAddr,
		identityBaseAddr,
		identityRecoveryAddr,
		coreAddr,
		feeTokenWhitelist,
		weeklyFeeAmount,
	} = relayerConfig()

	const privileges = [[owner, 3], [identityRecoveryAddr, 3]]

	const opts = {
		identityBaseAddr,
		privileges,
	}

	if (addReleyerRoutinesAuth) {
		const relayerAuth = getRelayerRoutinesAuthAuth({
			registry: registryAddr,
			outpace: coreAddr,
			validUntil: relayerRoutineAuthValidUntil,
			feeTokenAddr: feeTokenWhitelist[0].address,
			weeklyFeeAmount,
		})

		opts.routineAuthorizations = [relayerAuth]
	}

	const bytecode = await getIdentityBytecode(opts)
	const salt = keccak256(owner)

	const identityAddr = getAddress(
		`0x${generateAddress2(identityFactoryAddr, salt, bytecode).toString('hex')}`
	)

	return {
		identityFactoryAddr,
		identityBaseAddr,
		bytecode,
		salt,
		identityAddr,
		privileges,
	}
}

export async function deployIdentityContract({
	wallet,
	bytecode,
	salt,
	expectedAddr,
}) {
	const { provider, IdentityFactory } = await getEthers(wallet.authType)
	const signer = await getSigner({ wallet, provider })

	const pTx = await prepareTx({
		tx: IdentityFactory.deploy(bytecode, salt),
		provider,
		sender: wallet.address,
		gasLimit: hexlify(GAS_LIMIT_DEPLOY_CONTRACT),
	})

	pTx.gasLimit = hexlify(GAS_LIMIT_DEPLOY_CONTRACT)
	const identityFactoryWithSigner = IdentityFactory.connect(signer)

	const tx = identityFactoryWithSigner.deploy(bytecode, salt, pTx)

	processTx({
		tx,
		txSuccessData: {},
		from: wallet.address,
		account: {},
	})

	return tx
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
	const fees = bigNumberify(feeAmountTransfer)
		.mul(bigNumberify('2'))
		.add(sweepFees)
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

	const tx1 = {
		identityContract: identityAddr,
		feeTokenAddr: Dai.address,
		feeAmount: feeAmountTransfer,
		to: Dai.address,
		data: ERC20.functions.approve.encode([identityAddr, tokenAmount]),
	}

	const tx2 = {
		identityContract: identityAddr,
		feeTokenAddr: Dai.address,
		feeAmount: feeAmountTransfer,
		to: Dai.address,
		data: ERC20.functions.transfer.encode([withdrawTo, tokenAmount]),
	}
	const txns = [...sweepTxns, tx1, tx2]

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

	const result = await setAddrPriv(data)

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
