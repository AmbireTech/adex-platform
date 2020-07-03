import { ADD_ITEM, UPDATE_ITEM } from 'constants/actionTypes'
import {
	execute,
	addToast,
	updateSpinner,
	updateItems,
	updateValidatorAuthTokens,
	updateNewCampaign,
	handleAfterValidation,
	validateCampaignValidators,
	validateCampaignAmount,
	validateCampaignTitle,
	validateCampaignDates,
	validateCampaignUnits,
	validateSchemaProp,
	validateAudience,
	confirmAction,
	updateSelectedItems,
	saveAudience,
	updateNewItem,
} from 'actions'
import { push } from 'connected-react-router'
import { schemas, Campaign, helpers } from 'adex-models'
import { parseUnits } from 'ethers/utils'
import { getAllValidatorsAuthForIdentity } from 'services/smart-contracts/actions/stats'
import {
	openChannel,
	closeChannel,
} from 'services/smart-contracts/actions/core'
import {
	lastApprovedState,
	updateTargeting,
} from 'services/adex-validator/actions'
import {
	closeCampaignMarket,
	updateCampaign,
	getCampaigns,
} from 'services/adex-market/actions'
import { getErrorMsg } from 'helpers/errors'
import {
	t,
	selectAccount,
	selectNewCampaign,
	selectCampaignById,
	selectAuthSig,
	selectAuth,
	selectMainToken,
	selectNewItemByTypeAndId,
	selectAudienceByCampaignId,
	selectTargetingAnalytics,
	selectTargetingAnalyticsMinByCategories,
	selectTargetingAnalyticsCountryTiersCoefficients,
} from 'selectors'
import { formatTokenAmount } from 'helpers/formatters'
import {
	OPENING_CAMPAIGN,
	GETTING_CAMPAIGNS_FEES,
	PRINTING_CAMPAIGNS_RECEIPTS,
} from 'constants/spinners'
import Helper from 'helpers/miscHelpers'
import { addUrlUtmTracking } from 'helpers/utmHelpers'

const { audienceInputToTargetingRules, getSuggestedPricingBounds } = helpers

const { campaignPut } = schemas

const VALIDATOR_LEADER_URL = process.env.VALIDATOR_LEADER_URL
const VALIDATOR_LEADER_ID = process.env.VALIDATOR_LEADER_ID
const VALIDATOR_LEADER_FEE_NUM = process.env.VALIDATOR_LEADER_FEE_NUM
const VALIDATOR_LEADER_FEE_DEN = process.env.VALIDATOR_LEADER_FEE_DEN
const VALIDATOR_LEADER_FEE_ADDR = process.env.VALIDATOR_LEADER_FEE_ADDR

const VALIDATOR_FOLLOWER_URL = process.env.VALIDATOR_FOLLOWER_URL
const VALIDATOR_FOLLOWER_ID = process.env.VALIDATOR_FOLLOWER_ID
const VALIDATOR_FOLLOWER_FEE_NUM = process.env.VALIDATOR_FOLLOWER_FEE_NUM
const VALIDATOR_FOLLOWER_FEE_DEN = process.env.VALIDATOR_FOLLOWER_FEE_DEN
const VALIDATOR_FOLLOWER_FEE_ADDR = process.env.VALIDATOR_FOLLOWER_FEE_ADDR

// updatedCampaign updated campaign class instance
function updateCampaignOnMarket({ updated, toastLabel, toastArgs, toastType }) {
	return async function(dispatch, getState) {
		const updatedCampaign = (await updateCampaign({
			campaign: updated.marketUpdate,
			id: updated.id,
		})).campaign

		dispatch({
			type: UPDATE_ITEM,
			item: new Campaign({
				...updatedCampaign.spec,
				...updatedCampaign,
			}).plainObj(),
			itemType: 'Campaign',
		})
		addToast({
			type: toastType || 'success',
			label: t(toastLabel, {
				args: toastArgs || ['CAMPAIGN', updatedCampaign.title],
			}),
			timeout: 50000,
		})(dispatch)

		// Make sure to update tables
		updateUserCampaigns()(dispatch, getState)
	}
}

export function openCampaign() {
	return async function(dispatch, getState) {
		updateSpinner(OPENING_CAMPAIGN, true)(dispatch)
		try {
			const state = getState()
			const selectedCampaign = selectNewCampaign(state)
			const account = selectAccount(state)
			const campaign = { ...selectedCampaign }

			if (campaign.temp.useUtmTags) {
				campaign.adUnits = [...campaign.adUnits].map((unit, index) => ({
					...unit,
					targetUrl: addUrlUtmTracking({
						targetUrl: unit.targetUrl,
						campaign: campaign.title,
						content: `${index + 1}_${unit.type}`,
					}),
				}))
			}

			await getAllValidatorsAuthForIdentity({
				withBalance: [{ channel: campaign }],
				account,
			})

			const { storeCampaign } = await openChannel({
				campaign,
				account,
			})

			await saveAudience({
				campaignId: storeCampaign.id,
				audienceInput: campaign.audienceInput,
			})(dispatch, getState)

			dispatch({
				type: ADD_ITEM,
				item: storeCampaign,
				itemType: 'Campaign',
			})
			addToast({
				type: 'accept',
				label: t('OPENING_CAMPAIGN_SENT_TO_RELAYER', {
					args: [storeCampaign.id],
				}),
				timeout: 20000,
			})(dispatch)
		} catch (err) {
			console.error('ERR_OPENING_CAMPAIGN', err)
			addToast({
				type: 'cancel',
				label: t('ERR_OPENING_CAMPAIGN', {
					args: [Helper.getErrMsg(err)],
				}),
				timeout: 50000,
			})(dispatch)
			throw new Error('ERR_OPENING_CAMPAIGN', err)
		}
		updateSpinner(OPENING_CAMPAIGN, false)(dispatch)
		return true
	}
}

export const updateCampaignState = ({ campaign }) => {
	return async dispatch => {
		try {
			const state = await lastApprovedState({ campaign })
			const newCampaign = { ...campaign }
			newCampaign.state = state

			return dispatch({
				type: UPDATE_ITEM,
				item: newCampaign,
				itemType: 'Campaign',
			})
		} catch (err) {
			console.error('ERR_GETTING_CAMPAIGN_LAST_STATUS', err)
			addToast({
				type: 'cancel',
				label: t('ERR_GETTING_CAMPAIGN_LAST_STATUS', {
					args: [getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
		}
	}
}

// TEMP for testing in production until 4.1 is deployed
function getHumanFriendlyName(campaign) {
	if (campaign.status && campaign.status.humanFriendlyName === 'Closed')
		return 'Closed'
	switch ((campaign.status || {}).name) {
		case 'Active':
		case 'Ready':
		case 'Pending':
		case 'Initializing':
		case 'Waiting':
		case 'Offline':
		case 'Disconnected':
		case 'Unhealthy':
		case 'Invalid':
			return 'Active'
		case 'Expired':
		case 'Exhausted':
		case 'Withdraw':
			return 'Completed'
		default:
			return 'N/A'
	}
}

export function updateCampaignAudienceInput({
	updateField,
	itemId,
	validateId,
	onValid,
}) {
	return async function(dispatch, getState) {
		const state = getState()
		const { audienceInput } = selectNewItemByTypeAndId(
			state,
			'Campaign',
			itemId
		)

		const isValid = await validateAudience({
			validateId,
			inputs: audienceInput.inputs,
			dirty: true,
			propName: 'audienceInput',
		})(dispatch)

		if (isValid) {
			await updateField('audienceInput', audienceInput)
			onValid()
		}
	}
}

export function mapCurrentToNewCampaignAudienceInput({ itemId, dirtyProps }) {
	return async function(dispatch, getState) {
		const state = getState()
		const item = selectCampaignById(state, itemId)
		const campaign = selectNewItemByTypeAndId(state, 'Campaign', itemId)
		const initialAudienceInput = selectAudienceByCampaignId(state, itemId)
		const itemAudienceInput =
			item.audienceInput && Object.keys(item.audienceInput.inputs).length
				? item.audienceInput
				: initialAudienceInput

		const audienceInput = dirtyProps.includes('audienceInput')
			? campaign.audienceInput
			: item.audienceInput || itemAudienceInput

		updateNewItem(
			item,
			{ audienceInput: { ...audienceInput } },
			'Campaign',
			Campaign,
			item.id
		)(dispatch, getState)
	}
}

export function updateUserCampaigns() {
	return async function(dispatch, getState) {
		const state = getState()
		const hasAuth = selectAuth(state)
		const { identity } = selectAccount(state)
		const { address } = identity

		if (hasAuth && address) {
			try {
				const campaigns = await getCampaigns({
					all: true,
					byCreator: address,
					cacheBrake: true,
				})
				let campaignsMapped = campaigns
					.filter(
						c => c.creator && c.creator.toLowerCase() === address.toLowerCase()
					)
					.map(c => {
						const campaign = {
							...c.spec,
							...c,
							targetingRules: c.targetingRules || c.spec.targetingRules,
						}

						if (!campaign.humanFriendlyName) {
							campaign.status.humanFriendlyName = getHumanFriendlyName(campaign)
						}

						return campaign
					})

				updateItems({
					items: campaignsMapped,
					itemType: 'Campaign',
				})(dispatch)
			} catch (err) {
				console.error('ERR_GETTING_CAMPAIGNS', err)

				addToast({
					type: 'cancel',
					label: t('ERR_GETTING_CAMPAIGNS', {
						args: [getErrorMsg(err)],
					}),
					timeout: 20000,
				})(dispatch)
			}
		}
	}
}

export function closeCampaign({ campaign }) {
	return async function(dispatch, getState) {
		updateSpinner(`closing-campaign-${campaign.id}`, true)(dispatch)
		try {
			const state = getState()
			const authSig = selectAuthSig(state)
			const { account } = state.persist
			const { authTokens } = await closeChannel({ account, campaign })
			await closeCampaignMarket({ campaign, authSig })
			const newCampaign = { ...campaign }
			newCampaign.status = {
				...newCampaign.status,
				humanFriendlyName: 'Closed',
			}
			dispatch({
				type: UPDATE_ITEM,
				item: newCampaign,
				itemType: 'Campaign',
			})
			await updateValidatorAuthTokens({ newAuth: authTokens })(
				dispatch,
				getState
			)
			await updateUserCampaigns()(dispatch, getState)
			execute(push('/dashboard/advertiser/campaigns'))
			addToast({
				type: 'accept',
				label: t('SUCCESS_CLOSING_CAMPAIGN'),
				timeout: 20000,
			})(dispatch)
		} catch (err) {
			console.error('ERR_CLOSING_CAMPAIGN', err)
			addToast({
				type: 'cancel',
				label: t('ERR_CLOSING_CAMPAIGN', {
					args: [getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
		}
		updateSpinner(`closing-campaign-${campaign.id}`, false)(dispatch)
	}
}

export function pauseOrResumeCampaign({ campaign }) {
	return async function(dispatch, getState) {
		updateSpinner(`pausing-campaign-${campaign.id}`, true)(dispatch)
		let action = 'PAUSING'
		try {
			const state = getState()
			const { account } = state.persist
			const updated = new Campaign(campaign)

			const currentTargetingRules = updated.targetingRules || []
			const newRules = [...currentTargetingRules]

			const isPaused = (currentTargetingRules[0] || {}).onlyShowIf === true
			if (isPaused) {
				action = 'RESUMING'
				newRules.shift()
			} else {
				newRules.unshift({ onlyShowIf: false })
			}

			const { authTokens } = await updateTargeting({
				account,
				campaign: updated,
				targetingRules: newRules,
			})

			await updateValidatorAuthTokens({ newAuth: authTokens })(
				dispatch,
				getState
			)

			await updateCampaignOnMarket({
				updated,
				toastLabel: `SUCCESS_${action}_CAMPAIGN`,
			})(dispatch, getState)
		} catch (err) {
			console.error(`ERR_${action}_CAMPAIGN`, err)
			addToast({
				type: 'cancel',
				label: t(`ERR_${action}_CAMPAIGN`, {
					args: [getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
		}
		updateSpinner(`pausing-campaign-${campaign.id}`, false)(dispatch)
	}
}

export function excludeOrIncludeWebsites({
	campaignId,
	hostnames,
	exclude,
	action,
}) {
	return async function(dispatch, getState) {
		updateSpinner(`${action}-campaign-website${campaignId}`, true)(dispatch)

		try {
			const state = getState()
			const campaign = selectCampaignById(state, campaignId)
			const targetingData = selectTargetingAnalytics(state)
			const { account } = state.persist
			const updated = new Campaign(campaign)

			const campaignAudienceInput = selectAudienceByCampaignId(
				state,
				campaignId
			)

			// Add default value for legacy campaigns
			const newAudienceInput = {
				version: '1',
				inputs: { publishers: {} },
				...campaignAudienceInput,
			}
			newAudienceInput.inputs = { ...newAudienceInput.inputs }
			newAudienceInput.inputs.publishers = {
				...newAudienceInput.inputs.publishers,
			}

			const { inputs = {} } = newAudienceInput
			const { publishers = {} } = inputs

			// exclude
			if (exclude && publishers.apply && publishers.apply === 'in') {
				const newIn = [...(publishers.in || [])].filter(value => {
					const { hostname } = JSON.parse(value)
					return !hostnames.includes(hostname)
				})
				newAudienceInput.inputs.publishers.in = newIn
			}
			// include
			else if (!exclude && publishers.apply && publishers.apply === 'in') {
				const newIn = [...hostnames]
					// Filter already included
					.filter(h => [...(publishers.in || [])].some(x => x.includes(h)))
					.map(hostname =>
						JSON.stringify({
							hostname,
							publisher: (
								targetingData.find(x => x.hostname === hostname) || {}
							).owner,
						})
					)

				newAudienceInput.inputs.publishers.in = (publishers.in || []).concat(
					newIn
				)
			}
			// exclude
			else if (exclude && publishers.apply && publishers.apply === 'nin') {
				const newNin = hostnames
					// Filter already excluded
					.filter(h => ![...(publishers.nin || [])].some(x => x.includes(h)))
					.map(hostname =>
						JSON.stringify({
							hostname,
							publisher: (
								targetingData.find(x => x.hostname === hostname) || {}
							).owner,
						})
					)

				newAudienceInput.inputs.publishers.nin = (publishers.nin || []).concat(
					newNin
				)
			}
			// include
			else if (!exclude && publishers.apply && publishers.apply === 'nin') {
				const newNin = [...(publishers.nin || [])]
					// Filter selected
					.filter(value => {
						const { hostname } = JSON.parse(value)
						return !hostnames.includes(hostname)
					})
				newAudienceInput.inputs.publishers.nin = newNin
			}
			// exclude
			else if (
				exclude &&
				(!publishers.apply ||
					(publishers.apply && publishers.apply === 'allin'))
			) {
				const newNin = [...hostnames].map(hostname =>
					JSON.stringify({
						hostname,
						publisher: (targetingData.find(x => x.hostname === hostname) || {})
							.owner,
					})
				)

				newAudienceInput.inputs.publishers.apply = 'nin'
				newAudienceInput.inputs.publishers.nin = newNin
			}
			// include
			else if (
				!exclude &&
				(!publishers.apply ||
					(publishers.apply && publishers.apply === 'allin'))
			) {
				// There is nothing to do
				return addToast({
					type: 'success',
					label: t(`SUCCESS_${action}_WEBSITE`, {
						args: [hostnames.length, updated.title],
					}),
					timeout: 50000,
				})(dispatch)
			}

			if (
				newAudienceInput.inputs.publishers.apply === 'nin' &&
				!newAudienceInput.inputs.publishers.nin.length
			) {
				newAudienceInput.inputs.publishers.apply = 'allin'
				newAudienceInput.inputs.publishers.nin = null
			}

			const minByCategory = selectTargetingAnalyticsMinByCategories(state)
			const countryTiersCoefficients = selectTargetingAnalyticsCountryTiersCoefficients(
				state
			)

			const { decimals } = selectMainToken(state)
			const { pricingBounds, minPerImpression, maxPerImpression } = campaign

			// Legacy campaigns shim
			const campaignPricingBounds = pricingBounds || {
				IMPRESSION: {
					min: minPerImpression,
					max: maxPerImpression,
				},
			}

			const newRules = audienceInputToTargetingRules({
				audienceInput: newAudienceInput,
				minByCategory,
				countryTiersCoefficients,
				pricingBounds: campaignPricingBounds,
				decimals,
			})

			updated.targetingRules = newRules
			updated.audienceInput = newAudienceInput

			const { authTokens } = await updateTargeting({
				account,
				campaign: updated,
				targetingRules: newRules,
			})

			const updatedCampaign = (await updateCampaign({
				campaign: updated.marketUpdate,
				id: updated.id,
			})).campaign

			await updateValidatorAuthTokens({ newAuth: authTokens })(
				dispatch,
				getState
			)

			let toastType = 'success'
			let toastLabel = `SUCCESS_${action}_WEBSITE`

			if (
				newAudienceInput.inputs.publishers.apply === 'in' &&
				!newAudienceInput.inputs.publishers.in.length
			) {
				toastType = 'warning'
				toastLabel = `WARNING_NO_PUBLISHERS_${action}_WEBSITE`
			}

			await updateCampaignOnMarket({
				updated,
				toastType,
				toastLabel,
				roastArgs: [hostnames.length, updatedCampaign.title],
			})(dispatch, getState)
		} catch (err) {
			console.error(`ERR_${action}_WEBSITE`, err)
			addToast({
				type: 'cancel',
				label: t(`ERR_${action}_WEBSITE`, {
					args: [hostnames.length, getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
		}
		updateSpinner(`${action}-campaign-website${campaignId}`, true)(dispatch)
	}
}

const tempValidators = [
	{
		id: VALIDATOR_LEADER_ID,
		url: VALIDATOR_LEADER_URL,
		feeNum: VALIDATOR_LEADER_FEE_NUM,
		feeDen: VALIDATOR_LEADER_FEE_DEN,
		feeAddr: VALIDATOR_LEADER_FEE_ADDR,
	},
	{
		id: VALIDATOR_FOLLOWER_ID,
		url: VALIDATOR_FOLLOWER_URL,
		feeNum: VALIDATOR_FOLLOWER_FEE_NUM,
		feeDen: VALIDATOR_FOLLOWER_FEE_DEN,
		feeAddr: VALIDATOR_FOLLOWER_FEE_ADDR,
	},
]

export function validateNewCampaignAdUnits({
	validateId,
	dirty,
	onValid,
	onInvalid,
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)

		const state = getState()
		const campaign = selectNewCampaign(state)
		const { adUnits } = campaign

		const isValid = await validateCampaignUnits({ validateId, adUnits, dirty })(
			dispatch
		)

		await handleAfterValidation({ isValid, onValid, onInvalid })
		await updateSpinner(validateId, false)(dispatch)
	}
}

export function validateCampaignAudienceInput({
	validateId,
	dirty,
	onValid,
	onInvalid,
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)
		try {
			const state = getState()
			const { audienceInput = {}, temp } = selectNewCampaign(state)
			const { inputs } = audienceInput

			const isValid = await validateAudience({
				validateId,
				inputs,
				dirty,
				propName: 'audienceInput',
			})(dispatch)

			if (isValid) {
				const minByCategory = selectTargetingAnalyticsMinByCategories(state)
				const countryTiersCoefficients = selectTargetingAnalyticsCountryTiersCoefficients(
					state
				)
				const pricingBounds = getSuggestedPricingBounds({
					minByCategory,
					countryTiersCoefficients,
					audienceInput,
				})

				await updateNewCampaign('temp', {
					...temp,
					suggestedPricingBounds: pricingBounds,
				})(dispatch, getState)

				// Update pricingBounds here in order to avoid value check at nex steps
				await updateNewCampaign('pricingBounds', pricingBounds)(
					dispatch,
					getState
				)
			}

			await handleAfterValidation({ isValid, onValid, onInvalid })
		} catch (err) {
			console.log('err', err)
		}

		await updateSpinner(validateId, false)(dispatch)
	}
}

export function validateNewCampaignFinance({
	validateId,
	dirty,
	onValid,
	onInvalid,
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)
		try {
			const state = getState()
			const { decimals } = selectMainToken(state)
			const campaign = selectNewCampaign(state)
			const {
				validators,
				depositAmount,
				title,
				activeFrom,
				withdrawPeriodStart,
				created,
				pricingBounds,
				audienceInput,
				// minTargetingScore,
				// adUnits,
				temp = {},
			} = campaign

			const { maxChannelFees, maxDeposit } = temp

			const newCampaign = { ...campaign }

			if (!validators || !validators.length) {
				// TODO: temp - will need dropdown selector for the follower validator
				newCampaign.validators = tempValidators
				await updateNewCampaign('validators', newCampaign.validators)(
					dispatch,
					getState
				)
			}

			const validations = await Promise.all([
				validateCampaignValidators({ validateId, validators, dirty })(dispatch),
				validateCampaignAmount({
					validateId,
					prop: 'depositAmount',
					value: depositAmount,
					dirty,
					depositAmount,
					pricingBounds,
					errMsg: !dirty && 'REQUIRED_FIELD',
					maxDeposit,
					decimals,
				})(dispatch),
				validateCampaignAmount({
					validateId,
					prop: 'pricingBounds_min',
					value: pricingBounds.min,
					dirty,
					pricingBounds,
					depositAmount,
					errMsg: !dirty && 'REQUIRED_FIELD',
					maxDeposit,
					decimals,
				})(dispatch),
				validateCampaignTitle({
					validateId,
					title,
					dirty,
				})(dispatch),
				validateCampaignDates({
					validateId,
					prop: 'activeFrom',
					value: activeFrom,
					dirty,
					activeFrom,
					withdrawPeriodStart,
					created,
				})(dispatch),
				validateCampaignDates({
					validateId,
					prop: 'withdrawPeriodStart',
					value: withdrawPeriodStart,
					dirty,
					activeFrom,
					withdrawPeriodStart,
					created,
				})(dispatch),
			])

			const isValid = validations.every(v => v === true)

			if (typeof maxChannelFees !== 'string') {
				await updateSpinner(GETTING_CAMPAIGNS_FEES, true)(dispatch)

				const account = selectAccount(state)

				const {
					feesFormatted,
					maxAvailable,
					maxAvailableFormatted,
				} = await openChannel({
					campaign: { ...newCampaign },
					account,
					getFeesOnly: true,
					getMaxFees: true,
				})

				const newTemp = { ...temp }
				newTemp.maxChannelFees = feesFormatted
				newTemp.maxDeposit = maxAvailable
				newTemp.maxDepositFormatted = maxAvailableFormatted

				await updateNewCampaign('temp', newTemp)(dispatch, getState)
			}

			if (isValid) {
				const minByCategory = selectTargetingAnalyticsMinByCategories(state)
				const countryTiersCoefficients = selectTargetingAnalyticsCountryTiersCoefficients(
					state
				)

				const pricingBoundsInTokenValue = {
					min: parseUnits(pricingBounds.min, decimals),
					max: parseUnits(pricingBounds.max, decimals),
				}

				const targetingRules = audienceInputToTargetingRules({
					audienceInput,
					minByCategory,
					countryTiersCoefficients,
					pricingBounds: pricingBoundsInTokenValue,
					decimals,
				})
				await updateNewCampaign('targetingRules', targetingRules)(
					dispatch,
					getState
				)
			}

			await handleAfterValidation({ isValid, onValid, onInvalid })
		} catch (err) {
			console.error('ERR_VALIDATING_CAMPAIGN_FINANCE', err)
			addToast({
				type: 'cancel',
				label: t('ERR_VALIDATING_CAMPAIGN_FINANCE', {
					args: [getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
		}

		await updateSpinner(GETTING_CAMPAIGNS_FEES, false)(dispatch)
		await updateSpinner(validateId, false)(dispatch)
	}
}

export function getCampaignActualFees() {
	return async function(dispatch, getState) {
		await updateSpinner(GETTING_CAMPAIGNS_FEES, true)(dispatch)
		try {
			const state = getState()
			const campaign = selectNewCampaign(state)
			const mainToken = selectMainToken(state)
			const { temp = {}, depositAmount } = campaign

			const account = selectAccount(state)

			const { feesFormatted, fees } = await openChannel({
				campaign: { ...campaign },
				account,
				getFeesOnly: true,
			})

			const totalSpend = parseUnits(depositAmount, mainToken.decimals).add(fees)

			const totalSpendFormatted = formatTokenAmount(
				totalSpend.toString(),
				mainToken.decimals || 18,
				false,
				true
			)

			const newTemp = { ...temp }
			newTemp.feesFormatted = feesFormatted
			newTemp.totalSpendFormatted = totalSpendFormatted

			await updateNewCampaign('temp', newTemp)(dispatch, getState)
		} catch (err) {
			console.error('ERR_GETTING_CAMPAIGN_FEES', err)
			addToast({
				type: 'cancel',
				label: t('ERR_GETTING_CAMPAIGN_FEES', {
					args: [getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
		}

		await updateSpinner(GETTING_CAMPAIGNS_FEES, false)(dispatch)
	}
}

export function handlePrintSelectedReceiptsAdvertiser(selected) {
	return async function(dispatch, getState) {
		await updateSpinner(PRINTING_CAMPAIGNS_RECEIPTS, true)(dispatch)
		confirmAction(
			async () => {
				await updateSelectedItems('campaigns', selected)(dispatch)
				await dispatch(push('/dashboard/advertiser/receipts'))
				await updateSpinner(PRINTING_CAMPAIGNS_RECEIPTS, false)(dispatch)
			},
			async () => {
				await updateSpinner(PRINTING_CAMPAIGNS_RECEIPTS, false)(dispatch)
			},
			{
				cancelLabel: t('CANCEL'),
				confirmLabel: t('OK'),
				title: t('CONFIRM_DIALOG_PRINT_ALL_RECEIPTS_TITLE'),
				text: t('CONFIRM_DIALOG_PRINT_ALL_RECEIPTS_TEXT'),
			}
		)(dispatch, getState)
	}
}

export function validateAndUpdateCampaign({
	validateId,
	dirty,
	item,
	update,
	dirtyProps,
}) {
	return async function(dispatch, getState) {
		await updateSpinner(validateId, true)(dispatch)
		try {
			const {
				title,
				audienceInput,
				pricingBounds,
				minPerImpression,
				maxPerImpression,
			} = item

			const updated = new Campaign(item)
			const isAudienceUpdated = dirtyProps.includes('audienceInput')

			if (isAudienceUpdated) {
				const state = getState()
				const { decimals } = selectMainToken(state)
				const minByCategory = selectTargetingAnalyticsMinByCategories(state)
				const countryTiersCoefficients = selectTargetingAnalyticsCountryTiersCoefficients(
					state
				)

				// TODO: fix it when it is possible to edit pricing bounds
				// Legacy campaigns shim
				const campaignPricingBounds =
					pricingBounds && pricingBounds.IMPRESSION
						? pricingBounds
						: {
								IMPRESSION: {
									min: pricingBounds.min || minPerImpression,
									max: pricingBounds.min || maxPerImpression,
								},
						  }

				updated.targetingRules = audienceInputToTargetingRules({
					audienceInput,
					minByCategory,
					countryTiersCoefficients,
					pricingBounds: campaignPricingBounds,
					decimals,
				})
			}

			const validations = await Promise.all([
				validateCampaignTitle({
					validateId,
					title,
					dirty,
				})(dispatch),
				validateSchemaProp({
					validateId,
					value: updated.marketUpdate,
					prop: 'campaign',
					schema: campaignPut,
					dirty,
				})(dispatch),
			])

			const isValid = validations.every(v => v === true)

			if (isValid && update) {
				if (isAudienceUpdated) {
					const state = getState()
					const account = selectAccount(state)
					const { authTokens } = await updateTargeting({
						account,
						campaign: updated,
						targetingRules: updated.targetingRules,
					})
					await updateValidatorAuthTokens({ newAuth: authTokens })(
						dispatch,
						getState
					)
				}

				await updateCampaignOnMarket({
					updated,
					toastLabel: 'SUCCESS_UPDATING_ITEM',
				})(dispatch, getState)
			} else if (!isValid && update) {
				addToast({
					type: 'cancel',
					label: t('ERR_UPDATING_ITEM', {
						args: ['CAMPAIGN', getErrorMsg('INVALID_DATA')],
					}),
					timeout: 50000,
				})(dispatch)
			}
		} catch (err) {
			console.error('ERR_UPDATING_ITEM', err)
			addToast({
				type: 'cancel',
				label: t('ERR_UPDATING_ITEM', {
					args: ['CAMPAIGN', Helper.getErrMsg(err)],
				}),
				timeout: 50000,
			})(dispatch)
		}

		await updateSpinner(validateId, false)(dispatch)
	}
}
