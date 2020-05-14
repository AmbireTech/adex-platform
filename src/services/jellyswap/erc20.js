import { Providers, Contract } from '@jelly-swap/erc20'
import { DAI_CONFIG } from './config'

export const withdraw = async ({ id, secret, tokenAddress }) => {
	const config = DAI_CONFIG()

	const privateKey = 'PRIVATE_KEY'
	const provider = new Providers.WalletProvider(privateKey, config.providerUrl) // web wallet
	const contract = new Contract(provider, config)

	const txHash = await contract.withdraw({ id, secret, tokenAddress })

	return txHash
}

const onErc20Event = result => {
	console.log(result)

	switch (result.eventName) {
		case 'NEW_CONTRACT': {
			if (result.isSesnder) {
				// in AdEX case this won't happen, because user's won't send DAI, only BTC
			} else {
				// Handle DAI withdraw here.
			}
			break
		}

		case 'WITHDRAW': {
			// logic for when user's DAI withdraw is confirmed
			break
		}
	}
}

export const subscribe = (contract, userDAIAddress) => {
	contract.subscribe(onErc20Event, {
		new: {
			receiver: userDAIAddress,
		},
		withdraw: {
			receiver: userDAIAddress,
		},
	})
}
