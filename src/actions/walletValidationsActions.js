import { BigNumber } from 'ethers'
import { selectAccountStatsRaw, selectAccountStatsFormatted } from 'selectors'
import { validate } from 'actions'
import { formatTokenAmount } from 'helpers/formatters'

export function validateWalletFees({
	validateId,
	feesAmountBN,
	feeTokenAddr,
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

		const feeAssetAsSpendAsset = spendAsset === feeTokenAddr

		const feeAssetData = feeAssetAsSpendAsset
			? assetsData[spendAsset]
			: assetsData[feeTokenAddr]

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
				assetsDataFormatted[feeTokenAddr].balance,
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

export function validateWalletDiversificationAssets({
	validateId,
	formAsset,
	formAssetAmount,
	diversificationAssets,
	dirty,
}) {
	return async function(dispatch, getState) {
		let isValid = true
		let msg = ''
		let args = []
		const hasDiversifications =
			!!diversificationAssets && diversificationAssets.length

		const isValidDiversification =
			hasDiversifications &&
			diversificationAssets.every(asset => asset.address && asset.share)

		const hasFullDiversification = hasDiversifications
			? diversificationAssets.reduce(
					(used, asset) => used + asset.share,

					0
			  )
			: 0

		if (!hasDiversifications) {
			isValid = false
			msg = 'ERR_NO_DIVERSIFICATION_ASSETS_SELECTED'
		} else if (!isValidDiversification) {
			isValid = false
			msg = 'ERR_INVALID_DIVERSIFICATION_ASSETS'
			// TODO: args
		} else if (hasFullDiversification < 100) {
			isValid = false
			msg = 'ERR_DIVERSIFICATION_ASSETS_NOT_DISTRIBUTED'
		} else if (hasFullDiversification > 100) {
			isValid = false
			msg = 'ERR_DIVERSIFICATION_ASSETS_OVER_MAX'
		}

		await validate(validateId, 'diversificationAssets', {
			isValid,
			err: { msg, args },
			dirty,
		})(dispatch)

		return isValid
	}
}
