import { t } from 'selectors'
import { createSelector } from 'reselect'
import {
	selectAdUnitsArray,
	selectCampaignsArray,
	selectAdSlotsArray,
	selectAccountIdentityDeployData,
	selectAccountStatsFormatted,
	selectPublisherTotalImpressions,
} from 'selectors'

export const selectHasCreatedAdUnit = createSelector(
	[selectAdUnitsArray],
	adUnitsArray => adUnitsArray.length > 0
)

export const selectHasCreatedCampaign = createSelector(
	[selectCampaignsArray],
	campaignsArray => campaignsArray.length > 0
)

export const selectHasConfirmedEmail = createSelector(
	[selectAccountIdentityDeployData],
	({ meta }) => !!meta.emailConfirmed
)

export const selectHasFundedAccount = createSelector(
	[selectAccountStatsFormatted, selectHasCreatedCampaign],
	({ identityBalanceMainToken }, hasCampaign) =>
		hasCampaign || Number(identityBalanceMainToken) > 0
)

export const selectHasCreatedAdSlot = createSelector(
	selectAdSlotsArray,
	adSlotsArray => adSlotsArray.length > 0
)

export const selectHasAdSlotImpressions = createSelector(
	selectPublisherTotalImpressions,
	totalImpressions => totalImpressions > 0
)
export const selectHas5000Impressions = createSelector(
	selectPublisherTotalImpressions,
	totalImpressions => totalImpressions > 5000
)

export const sectStepsData = createSelector(
	[
		selectHasCreatedAdUnit,
		selectHasCreatedCampaign,
		selectHasCreatedAdSlot,
		selectHasConfirmedEmail,
		selectHasFundedAccount,
		selectHasAdSlotImpressions,
		selectHas5000Impressions,
	],
	(
		hasCreatedAdUnit,
		hasCreatedCampaign,
		hasCreatedAdSlot,
		hasConfirmedEmail,
		hasFundedAccount,
		hasImpressions,
		has5000Impressions
	) => ({
		hasCreatedAdUnit,
		hasCreatedCampaign,
		hasCreatedAdSlot,
		hasConfirmedEmail,
		hasFundedAccount,
		hasImpressions,
		has5000Impressions,
	})
)
