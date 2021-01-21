import { createCachedSelector } from 're-reselect'
import {
	selectCampaignById,
	selectCampaignsEventCountsStatsById,
} from 'selectors'

export const selectCampaignWithAnalyticsById = createCachedSelector(
	selectCampaignById,
	selectCampaignsEventCountsStatsById,
	(campaign, eventCounts, id) => {
		const withAnalytics = {
			...campaign,
			...eventCounts,
		}

		return withAnalytics
	}
)((_state, id) => id)
