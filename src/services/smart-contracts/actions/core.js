
import crypto from 'crypto'
import { Channel, splitSig, Transaction } from 'adex-protocol-eth/js'
import { getEthers } from 'services/smart-contracts/ethers'
import { getSigner } from 'services/smart-contracts/actions/ethers'
import { contracts } from '../contractsCfg'
import { sendOpenChannel } from 'services/adex-relayer/actions'
import { Campaign, AdUnit } from 'adex-models'
import {
	bigNumberify,
	randomBytes,
	parseUnits,
	Interface
} from 'ethers/utils'
import { Contract } from 'ethers'

const { AdExCore, DAI } = contracts
const Core = new Interface(AdExCore.abi)
const ERC20 = new Interface(DAI.abi)
const feeAmountApprove = '150000000000000000'
const feeAmountOpen = '160000000000000000'

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
		Dai,
		Identity
	} = await getEthers(wallet.authType)

	const openReady = getReadyCampaign(campaign, identity, Dai)
	const ethChannel = toEthereumChannel(openReady)
	const signer = await getSigner({ wallet, provider })
	const channel = {
		...openReady,
		id: ethChannel.hashHex(AdExCore.address)
	}
	const identityAddr = openReady.creator
	const identityContract = new Contract(
		identityAddr,
		Identity.abi,
		provider
	)
	const initialNonce = (await identityContract.nonce())
		.toNumber()

	const feeTokenAddr = campaign.temp.feeTokenAddr || Dai.address

	const tx1 = {
		identityContract: identityAddr,
		nonce: initialNonce,
		feeTokenAddr: feeTokenAddr,
		feeAmount: feeAmountApprove,
		to: Dai.address,
		data: ERC20.functions.approve
			.encode([AdExCore.address, channel.depositAmount])
	}

	const tx2 = {
		identityContract: identityAddr,
		nonce: initialNonce + 1,
		feeTokenAddr: feeTokenAddr,
		feeAmount: feeAmountOpen,
		to: AdExCore.address,
		data: Core.functions.channelOpen
			.encode([ethChannel.toSolidityTuple()])
	}

	const signTx = (tx) =>
		signer
			.signMessage(new Transaction(tx).hashHex(), { hex: true })
			.then(sig => splitSig(sig.signature))
	const txns = [tx1, tx2]
	const signatures = await Promise.all(txns.map(signTx))

	const data = {
		txnsRaw: txns,
		signatures,
		channel,
		identityAddr: identity.address
	}

	const result = await sendOpenChannel(data)
	return result
}