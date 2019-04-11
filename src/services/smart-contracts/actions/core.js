
import crypto from 'crypto'
import { Interface } from 'ethers/utils'
import { Channel, splitSig, Transaction } from 'adex-protocol-eth/js'
import { getEthers } from 'services/smart-contracts/ethers'
import { getSigner } from 'services/smart-contracts/actions/ethers'
import { contracts } from '../contractsCfg'
import { sendOpenChannel } from 'services/adex-relayer/actions'
import { Base, Campaign, AdUnit } from 'adex-models'
import { bigNumberify, randomBytes, parseUnits } from 'ethers/utils'

const { AdExCore, DAI } = contracts
const Core = new Interface(AdExCore.abi)

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

function getReadyCampaign(campaign, identity, Dai) {
	const newCampaign = new Campaign(campaign)
	newCampaign.creator = identity.address
	newCampaign.validUntil = Math.floor(newCampaign.validUntil / 1000)
	newCampaign.nonce = bigNumberify(randomBytes(32)).toString()
	newCampaign.adUnits = newCampaign.adUnits.map(unit => (new AdUnit(unit)).spec)
	newCampaign.depositAmount = parseUnits(newCampaign.depositAmount, DAI.decimals).toString()
	newCampaign.maxPerImpression = parseUnits(newCampaign.maxPerImpression, DAI.decimals).toString()
	newCampaign.minPerImpression = parseUnits(newCampaign.minPerImpression, DAI.decimals).toString()
	newCampaign.depositAsset = newCampaign.depositAsset || Dai.address

	return newCampaign.openReady
}

export async function openChannel({ campaign, account }) {
	const { wallet, identity } = account
	const {
		provider,
		AdExCore,
		Dai
	} = await getEthers(wallet.authType)

	const openReady = getReadyCampaign(campaign, identity, Dai)

	const ethChannel = toEthereumChannel(openReady)
	const identityNonce = await provider.getTransactionCount(identity.address)

	const signer = await getSigner({ wallet, provider })
	const channel = { ...openReady, id: ethChannel.hashHex(AdExCore.address) }

	const tx = {
		identityContract: openReady.creator,
		nonce: identityNonce,
		feeTokenAddr: Dai.address,
		feeAmount: '160000000000000000',
		to: AdExCore.address,
		data: Core.functions.channelOpen.encode([ethChannel.toSolidityTuple()])
	}

	const signTx = await signer.signMessage(new Transaction(tx).hash(), { hex: true })

	const data = {
		txnsRaw: [tx],
		signatures: [splitSig(signTx.signature)],
		channel,
		identityAddr: identity.address
	}

	const result = await sendOpenChannel(data)
	return result
}