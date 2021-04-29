import { BigNumber } from 'ethers'
import { selectAccountStatsRaw, selectAccountStatsFormatted } from 'selectors'
import { validate } from 'actions'
import { formatTokenAmount } from 'helpers/formatters'

export function validateWalletFees({
	validateId,
	feesAmountBN,
	feeAsset,
	amountToSpendBN,
	spendAsset,
	errorMsg = '',
	dirty,
}) {
	return async function(dispatch, getState) {
		let isValid = true
		let msg = errorMsg
		let args = []
		const state = getState()

		const { assetsData = {} } = selectAccountStatsRaw(state)
		const {
			assetsData: assetsDataFormatted = {},
		} = selectAccountStatsFormatted(state)

		const feeAssetAsSpendAsset = spendAsset === feeAsset

		const feeAssetData = feeAssetAsSpendAsset
			? assetsData[spendAsset]
			: assetsData[feeAsset]

		const availableBalanceFeeAsset = feeAssetData.balance

		const amountNeeded = BigNumber.from(feesAmountBN).add(
			BigNumber.from(feeAssetAsSpendAsset ? amountToSpendBN : 0)
		)

		const { symbol, decimals } = feeAssetData

		if (amountNeeded.gt(BigNumber.from(availableBalanceFeeAsset))) {
			const amountNeededFormatted = formatTokenAmount(
				amountNeeded,
				decimals,
				null,
				2
			)
			isValid = false
			msg = 'ERR_TX_INSUFFICIENT_BALANCE'
			args = [
				amountNeededFormatted,
				symbol,
				assetsDataFormatted[feeAsset].balance,
				symbol,
			]
		}

		await validate(validateId, 'fees', {
			isValid,
			err: { msg, args },
			dirty,
		})(dispatch)

		return isValid
	}
}
