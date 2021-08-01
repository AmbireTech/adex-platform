import { BigNumber } from 'ethers'
import { selectAccountStatsRaw, selectAccountStatsFormatted } from 'selectors'
import { validate } from 'actions'

export function validateWalletFees({
	validateId,
	totalFeesBN,
	feeTokenAddr,
	totalAmountToSpendBN,
	totalAmountToSpendFormatted,
	mainActionAmountBN,
	actionMinAmountBN,
	actionMinAmountFormatted,
	spendTokenAddr,
	errorMsg = '',
	dirty,
	skipStateUpdateIfInvalid,
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

		const feeAssetAsSpendAsset = spendTokenAddr === feeTokenAddr

		const feeAssetData = feeAssetAsSpendAsset
			? assetsData[spendTokenAddr]
			: assetsData[feeTokenAddr]

		const availableBalanceFeeAsset = feeAssetData.totalAvailable

		const { symbol } = feeAssetData

		if (totalAmountToSpendBN.gt(BigNumber.from(availableBalanceFeeAsset))) {
			isValid = false
			msg = 'ERR_TX_INSUFFICIENT_BALANCE'
			args = [
				totalAmountToSpendFormatted,
				symbol,
				assetsDataFormatted[feeTokenAddr].totalAvailable,
				symbol,
			]
		}

		if (actionMinAmountBN.gt(totalAmountToSpendBN)) {
			isValid = false
			msg = 'ERR_TX_SUB_MIN_ACTION_AMOUNT'
			args = [
				actionMinAmountFormatted,
				symbol,
				totalAmountToSpendFormatted,
				symbol,
			]
		}

		if (isValid || (!isValid && !skipStateUpdateIfInvalid)) {
			await validate(validateId, 'fees', {
				isValid,
				err: { msg, args },
				dirty,
			})(dispatch)
		}

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
