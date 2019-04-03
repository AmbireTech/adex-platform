
import crypto from 'crypto'
import { Channel } from 'adex-protocol-eth/js'
import { getEthers } from 'services/smart-contracts/ethers'
import { getSigner } from 'services/smart-contracts/actions/ethers'

const TEST_CHANNEL = {
	id: '',
	creator: '',
	depositAsset: '',
	depositAmount: (420 * 10 ** 15).toString(),
	validUntil: 1554771428,
	spec: {
		// ((10**18) * 0.5) / 1000
		minPerImpression: '305000000000009',
		validators: [
			{
				id: '0x2892f6C41E0718eeeDd49D98D648C789668cA67d',
				url: 'https://tom.adex.network',
				fee: '0'
			},
			{
				id: '0xce07CbB7e054514D590a0262C93070D838bFBA2e',
				url: 'https://jerry.adex.network',
				fee: '0'
			}
		],
		created: Date.now()
	}
}

function toEthereumChannel(channel) {
	const specHash = crypto
		.createHash('sha256')
		.update(JSON.stringify(channel.spec))
		.digest()

	return new Channel({
		creator: channel.creator,
		tokenAddr: channel.depositAsset,
		tokenAmount: channel.depositAmount,
		validUntil: channel.validUntil,
		validators: channel.spec.validators.map(v => v.id),
		spec: specHash
	})
}

export async function submitChannel({ channel, account }) {
	const {
		provider,
		AdExCore,
		Dai
	} = await getEthers(account._wallet.authType)

	const chn = { ...(channel || TEST_CHANNEL) }
	chn.depositAsset = chn.depositAsset || Dai.address
	chn.creator = account._wallet.address

	const ethChannel = toEthereumChannel(chn)
	const signer = await getSigner({ account, provider }) 

	const daiWithSigner = Dai.connect(signer)

	const allowanceTx = daiWithSigner
		.approve(AdExCore.address, chn.depositAmount)

	const coreWithSigner = AdExCore.connect(signer)
	const inputData = ethChannel.toSolidityTuple()
	const tx = coreWithSigner
		.channelOpen(inputData, { gasLimit: 300000 })
		.catch(err => {
			console.log('err', err)
		})

	const a = await allowanceTx
	const b = await tx

	// TODO: handle tx
}