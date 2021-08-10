import { BigNumber, utils } from 'ethers'
import { selectAccountStatsRaw, selectAccountStatsFormatted } from 'selectors'
import { validate } from 'actions'
import { validations } from 'adex-models'
const { isNumberString } = validations

export function validateWalletFees({
	validateId,
	actionName,
	// totalFeesBN,
	feeTokenAddr,
	totalAmountToSpendBN,
	totalAmountToSpendFormatted,
	// mainActionAmountBN,
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

		// NOTE: WETH specific
		const availableBalanceFeeAsset =
			feeAssetData.totalAvailableMainAsset || feeAssetData.totalAvailable

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
				actionName,
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
	// fromAsset,
	// fromAssetAmount,
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

		const diversificationShares = hasDiversifications
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
		} else if (diversificationShares < 100) {
			isValid = false
			msg = 'ERR_DIVERSIFICATION_ASSETS_NOT_DISTRIBUTED'
			args = [diversificationShares]
		} else if (diversificationShares > 100) {
			isValid = false
			msg = 'ERR_DIVERSIFICATION_ASSETS_OVER_MAX'
			args = [diversificationShares]
		}

		await validate(validateId, 'diversificationAssets', {
			isValid,
			err: { msg, args },
			dirty,
		})(dispatch)

		return isValid
	}
}

export function validateActionInputAmount({
	validateId,
	// actionName,
	value,
	inputTokenAddr,
	prop,
	// errorMsg = '',
	dirty,
}) {
	return async function(dispatch, getState) {
		let isValid = isNumberString(value)
		let msg = 'ERR_INVALID_AMOUNT_VALUE'
		let args = []
		const state = getState()

		const { assetsData = {} } = selectAccountStatsRaw(state)
		const {
			assetsData: assetsDataFormatted = {},
		} = selectAccountStatsFormatted(state)

		const tokenData = assetsData[inputTokenAddr]

		const availableBalanceFeeAsset = tokenData.totalAvailable
		const { symbol, decimals } = tokenData

		const amount = isValid ? utils.parseUnits(value, decimals) : null
		if (isValid && amount.isZero()) {
			isValid = false
			msg = 'ERR_ZERO_AMOUNT'
		} else if (isValid && amount.gt(BigNumber.from(availableBalanceFeeAsset))) {
			isValid = false
			msg = 'ERR_TX_INSUFFICIENT_BALANCE'
			args = [
				value,
				symbol,
				assetsDataFormatted[inputTokenAddr].totalAvailable,
				symbol,
			]
		}

		await validate(validateId, prop, {
			isValid,
			err: { msg, args },
			dirty,
		})(dispatch)

		return isValid
	}
}
