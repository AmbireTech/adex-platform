import { getEthers } from 'services/smart-contracts/ethers'
import { getSigner, prepareTx, processTx } from 'services/smart-contracts/actions/ethers'
import { ethers, utils } from 'ethers'
import { generateAddress2 } from 'ethereumjs-util'
import { identityBytecode } from 'services/adex-relayer/actions'

const IDENTITY_BASE_ADDR = process.env.IDENTITY_BASE_ADDR
const IDENTITY_FACTORY_ADDR = process.env.IDENTITY_FACTORY_ADDR
const gasLimit = 150000

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

export const deployIdentityContract = async ({
	wallet, bytecode, salt, expectedAddr }) => {

	const { provider, IdentityFactory } = await getEthers(wallet.authType)
	const signer = await getSigner({ wallet, provider })

	const pTx = await prepareTx({
		tx: IdentityFactory.deploy(
			bytecode,
			salt
		),
		provider,
		sender: wallet.address
	})

	pTx.gasLimit = utils.hexlify(gasLimit)
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
}

export const getPrivileges = ({
	walletAddr,
	identityAddr,
	walletAuthType
}) => {
	return getEthers(walletAuthType)
		.then(({ provider, Identity }) => {
			const contract = new ethers
				.Contract(identityAddr, Identity.abi, provider)
			return contract.privileges(walletAddr)
		})
}