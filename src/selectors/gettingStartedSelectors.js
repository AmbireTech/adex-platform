import { createSelector } from 'reselect'
import {
	selectAdUnitsArray,
	selectCampaignsArray,
	selectAccountIdentityDeployData,
	selectAccountStatsFormatted,
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
