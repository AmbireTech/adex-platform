import { getEthers } from 'services/smart-contracts/ethers'
import {
	getSigner,
	prepareTx,
	processTx,
	getMultipleTxSignatures
} from 'services/smart-contracts/actions/ethers'
import {
	ethers,
	Contract
} from 'ethers'
import {
	Interface,
	bigNumberify,
	parseUnits,
	randomBytes,
	getAddress,
	hexlify
} from 'ethers/utils'
import { generateAddress2 } from 'ethereumjs-util'
import { identityBytecode, executeTx, setAddrPriv } from 'services/adex-relayer/actions'
import { formatTokenAmount } from 'helpers/formatters'
import { contracts } from '../contractsCfg'
const { DAI } = contracts

const IDENTITY_BASE_ADDR = process.env.IDENTITY_BASE_ADDR
const IDENTITY_FACTORY_ADDR = process.env.IDENTITY_FACTORY_ADDR
const GAS_LIMIT_DEPLOY_CONTRACT = 150000
const feeAmountTransfer = '150000000000000000'
const feeAmountSetPrivileges = '150000000000000000'
const ERC20 = new Interface(DAI.abi)

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

export async function deployIdentityContract({
	wallet, bytecode, salt, expectedAddr }) {

	const { provider, IdentityFactory } = await getEthers(wallet.authType)
	const signer = await getSigner({ wallet, provider })

	const pTx = await prepareTx({
		tx: IdentityFactory.deploy(
			bytecode,
			salt
		),
		provider,
		sender: wallet.address,
		gasLimit: hexlify(GAS_LIMIT_DEPLOY_CONTRACT)
	})

	pTx.gasLimit = hexlify(GAS_LIMIT_DEPLOY_CONTRACT)
	const identityFactoryWithSigner = IdentityFactory.connect(signer)

	const tx = identityFactoryWithSigner.deploy(
		bytecode,
		salt,
		pTx
	)

	processTx({
		tx,
		txSuccessData: {},
		from: wallet.address,
		account: {}
	})

	return tx
}

export function getPrivileges({
	walletAddr,
	identityAddr,
	walletAuthType
}) {
	return getEthers(walletAuthType)
		.then(({ provider, Identity }) => {
			const contract = new ethers
				.Contract(identityAddr, Identity.abi, provider)
			return contract.privileges(walletAddr)
		})
}

export async function sendDaiToIdentity({
	account,
	amountToSend,
	// gas,
	estimateGasOnly
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
		sender: wallet.address
	})

	if (estimateGasOnly) {
		return pTx.gasLimit
	}

	processTx({
		tx: daiWithSigner.transfer(identity.address, tokenAmount, pTx),
		txSuccessData: { txMethod: 'TX_SEND_DAI_TO_IDENTITY' },
		from: wallet.address,
		fromType: 'wallet',
		account
	})

	return {}
}

export async function withdrawFromIdentity({
	account,
	amountToWithdraw,
	withdrawTo,
	getFeesOnly
}) {
	const toWithdraw = parseUnits(amountToWithdraw, 18)
	const fees = bigNumberify(feeAmountTransfer).mul(bigNumberify('2'))
	const tokenAmount = toWithdraw.sub(fees).toString()

	if (getFeesOnly) {
		return {
			fees: formatTokenAmount(fees.toString(), 18),
			toGet: formatTokenAmount(tokenAmount, 18)
		}
	}

	const { wallet, identity } = account
	const {
		provider,
		Dai,
		Identity } = await getEthers(wallet.authType)
	const signer = await getSigner({ wallet, provider })
	const identityAddr = identity.address

	const identityContract = new Contract(
		identityAddr,
		Identity.abi,
		provider
	)

	const initialNonce = (await identityContract.nonce())
		.toNumber()

	const tx1 = {
		identityContract: identityAddr,
		nonce: initialNonce,
		feeTokenAddr: Dai.address,
		feeAmount: feeAmountTransfer,
		to: Dai.address,
		data: ERC20.functions.approve
			.encode([identityAddr, tokenAmount])
	}

	const tx2 = {
		identityContract: identityAddr,
		nonce: initialNonce + 1,
		feeTokenAddr: Dai.address,
		feeAmount: feeAmountTransfer,
		to: Dai.address,
		data: ERC20.functions.transfer
			.encode([withdrawTo, tokenAmount])
	}

	const txns = [tx1, tx2]
	const signatures = await getMultipleTxSignatures({ txns, signer })

	const data = {
		txnsRaw: txns,
		signatures,
		identityAddr: identity.address
	}

	const result = await executeTx(data)

	return {
		result
	}
}

export async function setIdentityPrivilege({
	account,
	setAddr,
	privLevel,
	getFeesOnly
}) {
	const fees = bigNumberify(feeAmountSetPrivileges)

	if (getFeesOnly) {
		return {
			fees: formatTokenAmount(fees.toString(), 18)
		}
	}

	const { wallet, identity } = account
	const {
		provider,
		Dai,
		Identity } = await getEthers(wallet.authType)
	const signer = await getSigner({ wallet, provider })
	const identityAddr = identity.address

	const identityContract = new Contract(
		identityAddr,
		Identity.abi,
		provider
	)

	const identityInterface = new Interface(
		Identity.abi
	)

	const initialNonce = (await identityContract.nonce())
		.toNumber()

	const tx1 = {
		identityContract: identityAddr,
		nonce: initialNonce,
		feeTokenAddr: Dai.address,
		feeAmount: feeAmountSetPrivileges,
		to: identityAddr,
		data: identityInterface
			.functions
			.setAddrPrivilege
			.encode([setAddr, privLevel])
	}

	const txns = [tx1]
	const signatures = await getMultipleTxSignatures({ txns, signer })

	const data = {
		txnsRaw: txns,
		signatures,
		identityAddr: identity.address,
		setAddr,
		privLevel
	}

	const result = await setAddrPriv(data)

	return {
		result
	}
}
