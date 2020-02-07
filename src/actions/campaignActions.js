import * as types from 'constants/actionTypes'
import {
	execute,
	addToast,
	updateSpinner,
	updateItems,
	updateValidatorAuthTokens,
	updateNewItem,
	handleAfterValidation,
	validateCampaignValidators,
	validateCampaignAmount,
	validateCampaignTitle,
	validateCampaignDates,
	validateCampaignUnits,
} from 'actions'
import { push } from 'connected-react-router'
import { parseUnits, bigNumberify } from 'ethers/utils'
import { getAllValidatorsAuthForIdentity } from 'services/smart-contracts/actions/stats'
import { getCampaigns } from 'services/adex-market/actions'
import {
	openChannel,
	closeChannel,
} from 'services/smart-contracts/actions/core'
import {
	lastApprovedState,
	campaignAnalytics,
} from 'services/adex-validator/actions'
import { closeCampaignMarket } from 'services/adex-market/actions'
import { getErrorMsg } from 'helpers/errors'
import {
	t,
	selectAccount,
	selectRelayerConfig,
	selectCampaigns,
	selectNewCampaign,
	selectAuthSig,
	selectAuth,
	selectMainToken,
} from 'selectors'
import { formatTokenAmount } from 'helpers/formatters'
import { Campaign } from 'adex-models'
import { OPENING_CAMPAIGN, GETTING_CAMPAIGNS_FEES } from 'constants/spinners'

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

export function openCampaign({ campaign }) {
	return async function(dispatch, getState) {
		updateSpinner(OPENING_CAMPAIGN, true)(dispatch)
		const account = selectAccount(getState())
		try {
			await getAllValidatorsAuthForIdentity({
				withBalance: [{ channel: campaign }],
				account,
			})

			const { storeCampaign } = await openChannel({
				campaign,
				account,
			})

			dispatch({
				type: types.ADD_ITEM,
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
					args: [getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
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
				type: types.UPDATE_ITEM,
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

export function updateUserCampaigns(updateStats = true) {
	return async function(dispatch, getState) {
		const hasAuth = selectAuth(getState())
		const { wallet, identity } = selectAccount(getState())
		const { authSig } = wallet
		const { address } = identity
		const campaignsFromStore = selectCampaigns(getState())
		const campaignPromises = []
		if (hasAuth && authSig && address) {
			try {
				const campaigns = await getCampaigns({ authSig, creator: address })
				let campaignsMapped = campaigns
					.filter(
						c => c.creator && c.creator.toLowerCase() === address.toLowerCase()
					)
					.map(c => {
						if (updateStats) {
							// TODO: investigate - this is wrong
							// there are diffecences b/w total clicks from advanced stats
							// and doing it like this
							const impressions = campaignAnalytics({
								campaign: c,
								eventType: 'IMPRESSION',
								metric: 'eventCounts',
								timeframe: 'year',
								limit: 200,
							})
							const clicks = campaignAnalytics({
								campaign: c,
								eventType: 'CLICK',
								metric: 'eventCounts',
								timeframe: 'year',
								limit: 200,
							})
							campaignPromises.push(impressions)
							campaignPromises.push(clicks)
						}

						const campaign = { ...c.spec, ...c }

						if (!campaign.humanFriendlyName) {
							campaign.status.humanFriendlyName = getHumanFriendlyName(campaign)
						}
						if (!updateStats) {
							//when not updating the stats keep the previous
							const { impressions, clicks } = campaignsFromStore[c.id] || {
								impressions: 0,
								clicks: 0,
							}
							campaign.impressions = impressions
							campaign.clicks = clicks
						}
						return campaign
					})
				if (updateStats) {
					campaignsMapped = await Promise.all(campaignPromises).then(function(
						results
					) {
						// replace promises with their resolved values
						let index = 0
						for (let i = 0; i < results.length; i += 2) {
							campaignsMapped[index].impressions = results[i].aggr.reduce(
								(a, b) => a + (Number(b.value) || 0),
								0
							)
							campaignsMapped[index].clicks = results[i + 1].aggr.reduce(
								(a, b) => a + (Number(b.value) || 0),
								0
							)
							++index
						}
						return campaignsMapped
					})
				}

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
		updateSpinner('closing-campaign', true)(dispatch)
		try {
			const state = getState()
			const authSig = selectAuthSig(state)
			const { account } = state.persist
			const { authTokens } = await closeChannel({ account, campaign })
			await closeCampaignMarket({ campaign, authSig })
			updateValidatorAuthTokens({ newAuth: authTokens })(dispatch, getState)
			execute(push('/dashboard/advertiser/campaigns'))
			addToast({
				dispatch,
				type: 'accept',
				toastStr: 'SUCCESS_CLOSING_CAMPAIGN',
				args: [campaign.id],
			})
			updateUserCampaigns(dispatch, getState)
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
		updateSpinner('closing-campaign', false)(dispatch)
	}
}

export function updateNewCampaign(prop, value, newValues) {
	return async function(dispatch, getState) {
		const currentCampaign = selectNewCampaign(getState())
		await updateNewItem(
			currentCampaign,
			newValues || { [prop]: value },
			'Campaign',
			Campaign
		)(dispatch)
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

		const isValid = await validateCampaignUnits({ validateId, adUnits, dirty })

		await handleAfterValidation({ isValid, onValid, onInvalid })

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
			const campaign = selectNewCampaign(state)
			const {
				validators,
				depositAmount,
				minPerImpression,
				title,
				activeFrom,
				withdrawPeriodStart,
				created,
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
					minPerImpression,
					errMsg: !dirty && 'REQUIRED_FIELD',
					maxDeposit,
				})(dispatch),
				validateCampaignAmount({
					validateId,
					prop: 'minPerImpression',
					value: minPerImpression,
					dirty,
					depositAmount,
					minPerImpression,
					errMsg: !dirty && 'REQUIRED_FIELD',
					maxDeposit,
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
