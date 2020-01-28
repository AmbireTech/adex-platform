import * as types from 'constants/actionTypes'
import {
	execute,
	addToast,
	updateSpinner,
	updateItems,
	updateValidatorAuthTokens,
} from 'actions'
import { push } from 'connected-react-router'
import { parseUnits, bigNumberify } from 'ethers/utils'
import { getAllValidatorsAuthForIdentity } from 'services/smart-contracts/actions/stats'
import { getCampaigns } from 'services/adex-market/actions'
import {
	openChannel,
	closeChannel,
} from 'services/smart-contracts/actions/core'
import { lastApprovedState } from 'services/adex-validator/actions'
import { closeCampaignMarket } from 'services/adex-market/actions'
import { getErrorMsg } from 'helpers/errors'
import {
	t,
	selectAccount,
	selectRelayerConfig,
	selectAuthSig,
	selectAuth,
} from 'selectors'
import { OPENING_CAMPAIGN } from 'constants/spinners'

export function openCampaign({ campaign }) {
	return async function(dispatch, getState) {
		updateSpinner(OPENING_CAMPAIGN, true)(dispatch)
		const account = selectAccount(getState())
		try {
			await getAllValidatorsAuthForIdentity({
				withBalance: [{ channel: campaign }],
				account,
			})

			const { readyCampaign } = await openChannel({
				campaign,
				account,
			})

			dispatch({
				type: types.ADD_ITEM,
				item: readyCampaign,
				itemType: 'Campaign',
			})
			addToast({
				type: 'accept',
				label: t('OPENING_CAMPAIGN_SENT_TO_RELAYER', {
					args: [readyCampaign.id],
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

export function updateUserCampaigns() {
	return async function(dispatch, getState) {
		const hasAuth = selectAuth(getState())
		const { wallet, identity } = selectAccount(getState())
		const { authSig } = wallet
		const { address } = identity

		if (hasAuth && authSig && address) {
			try {
				const campaigns = await getCampaigns({ authSig, creator: address })

				const campaignsMapped = campaigns
					.filter(
						c => c.creator && c.creator.toLowerCase() === address.toLowerCase()
					)
					.map(c => {
						const campaign = { ...c.spec, ...c }

						if (!campaign.humanFriendlyName) {
							campaign.status.humanFriendlyName = getHumanFriendlyName(campaign)
						}

						return campaign
					})
				updateItems({ items: campaignsMapped, itemType: 'Campaign' })(dispatch)
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
				dispatch,
				type: 'cancel',
				toastStr: 'ERR_CLOSING_CAMPAIGN',
				args: [getErrorMsg(err)],
			})
		}
		updateSpinner('closing-campaign', false)(dispatch)
	}
}
