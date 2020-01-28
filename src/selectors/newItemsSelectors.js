import {
	Campaign as CampaignModel,
	AdUnit as AdUnitModel,
	AdSlot as AdSlotModel,
} from 'adex-models'

import { createSelector } from 'reselect'

export const selectNewItems = state => state.memory.newItem

export const selectNewCampaign = createSelector(
	selectNewItems,
	Campaign => new CampaignModel(Campaign)
)

export const selectNewAdUnit = createSelector(
	selectNewItems,
	AdUnit => new AdUnitModel(AdUnit)
)

export const selectNewAdSlot = createSelector(
	selectNewItems,
	AdSlot => new AdSlotModel(AdSlot)
)
