import { Providers, Contract, Adapter } from '@jelly-swap/bitcoin'
import { Wallet } from '@jelly-swap/btc-web-wallet'

import { BTC_CONFIG } from './config'

export const createWallet = (mnemonic, providerUrl) => {
	const provider = new Providers.BitcoinProvider(providerUrl)
	return new Wallet(mnemonic, provider)
}

// const userInput = {
//     network: 'BTC',
//     inputAmount: '0.01', // BTC amount

//     outputNetwork: 'DAI',
//     outputAmount: '84212086000000000000', // DAI amount

//     sender: 'USER_BTC_ADDRESS', // user's BTC address
//     outputAddress: '0x45ce9d7bdadb704c68242118e2b8586e491e5c51', // user DAI's address

//     secret: 'film ritual cream paper try search asthma grab admit viable work auction',
// };
export const initiateSwap = async userInput => {
	const config = BTC_CONFIG()

	const mnemonic =
		'choose stone donkey wheat pudding gasp harsh pupil sibling post brief afraid'

	const wallet = createWallet(mnemonic, config.providerUrl)

	const contract = new Contract(wallet, config)

	const adapter = new Adapter(config)

	const swapInput = adapter.formatInput(userInput)

	const txHash = await contract.newContract(swapInput)

	return txHash
}

const onBtcEvent = result => {
	console.log(result)

	switch (result.eventName) {
		case 'NEW_CONTRACT': {
			if (result.isSesnder) {
				// logic for when user's BTC swap is confirmed
			} else {
				// when result.isSender is false, this means the swap is made from LP to the user and the user needs to withdraw the BTC
				// in AdEX case this won't happen.
			}
			break
		}

		case 'WITHDRAW': {
			// logic for BTC withdraw
			// in AdEX case this won't happen.
			break
		}
	}
}

export const subscribe = (contract, userBtcAddress) => {
	contract.subscribe(onBtcEvent, {
		new: {
			type: 'getSwapsByAddressAndBlock',
			address: userBtcAddress,
		},
		withdraw: {
			type: 'getWithdrawByReceiverAndBlock',
			address: userBtcAddress,
		},
	})
}
