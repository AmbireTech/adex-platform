// import {
// 	getAssets,
// 	getPath,
// 	uniswapRouters,
// 	getTokens,
// 	isETHBasedToken,
// } from 'services/adex-wallet'
import { getEthers } from 'services/smart-contracts/ethers'
import {
	utils,
	//  BigNumber
} from 'ethers'
// import { contracts } from 'services/smart-contracts/contractsCfg'
// import {
// 	ON_CHAIN_ACTIONS,
// 	getWalletIdentityTxnsWithNoncesAndFees,
// 	getWalletIdentityTxnsTotalFees,
// getTxnsEstimationData,
// processExecuteWalletTxns,
// getWalletApproveTxns,
// } from './walletIdentity'
// import { formatTokenAmount } from 'helpers/formatters'
// import { t, selectAccountIdentityAddr } from 'selectors'

// import {
// 	getUniToken,
// 	// getPollStateData,
// 	// getUniv2RouteAndTokens,
// 	getUniv3Route,
// 	getTradeOutData,
// 	getEthBasedTokensToWETHTxns,
// 	getEthBasedTokensToETHTxns,
// 	aaveUnwrapTokenAmount,
// 	getAAVEInterestToken,
// 	txnsUnwrapAAVEInterestToken,
// } from 'services/smart-contracts/actions/walletCommon'

const { Interface } = utils

export async function walletSetIdentityPrivilege({
	account,
	setAddr,
	privLevel,
	feeTokenAddr,
}) {
	// TODO:
	const { wallet, identity } = account
	const { IdentityPayable } = await getEthers(wallet.authType)
	const identityAddr = identity.address

	const identityInterface = new Interface(IdentityPayable.abi)

	const tx1 = {
		identityContract: identityAddr,
		feeTokenAddr,
		to: identityAddr,
		data: identityInterface.encodeFunctionData('setAddrPrivilege', [
			setAddr,
			privLevel,
		]),
	}

	const txns = [tx1]

	// TODO
}
