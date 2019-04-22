import { getEthers } from 'services/smart-contracts/ethers'
import { getSigner, prepareTx, processTx } from 'services/smart-contracts/actions/ethers'
import { ethers, utils } from 'ethers'
import { generateAddress2 } from 'ethereumjs-util'
import { identityBytecode } from 'services/adex-relayer/actions'

const IDENTITY_BASE_ADDR = process.env.IDENTITY_BASE_ADDR
const IDENTITY_FACTORY_ADDR = process.env.IDENTITY_FACTORY_ADDR
const GAS_LIMIT_DEPLOY_CONTRACT = 150000

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
		`0x${Buffer.from(utils.randomBytes(32)).toString('hex')}`
	const expectedAddr = utils.getAddress(
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
		gasLimit: utils.hexlify(GAS_LIMIT_DEPLOY_CONTRACT)
	})

	pTx.gasLimit = utils.hexlify(GAS_LIMIT_DEPLOY_CONTRACT)
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
	gas,
	estimateGasOnly
}) {
	const { wallet, identity } = account
	const { provider, Dai } = await getEthers(wallet.authType)
	const signer = await getSigner({ wallet, provider })
	const daiWithSigner = Dai.connect(signer)
	const tokenAmount = ethers.utils.parseUnits(amountToSend, 18).toString()
	const walletAv = await Dai.balanceOf(wallet.address)

	const signerAddr = await signer.getAddress()
	console.log('signerAddr', signerAddr)
	console.log('wallet', wallet.address)
	console.log('identity', identity.address)
	console.log('walletAv   ', walletAv.toString())
	console.log('tokenAmount', tokenAmount.toString())

	const pTx = await prepareTx({
		tx: Dai.transferFrom(wallet.address, identity.address, tokenAmount),
		provider,
		// gasLimit,
		sender: wallet.address
	})

	if (estimateGasOnly) {
		return pTx.gasLimit
	}

	processTx({
		tx: daiWithSigner.transferFrom(wallet.address, identity.address, amountToSend, pTx),
		txSuccessData: { txMethod: 'TX_SEND_DAI_TO_IDENTITY' },
		from: wallet.address,
		account
	})

	return {}
}

