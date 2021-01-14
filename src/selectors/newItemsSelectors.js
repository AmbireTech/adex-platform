import {
	Campaign as CampaignModel,
	AdUnit as AdUnitModel,
	AdSlot as AdSlotModel,
	Audience as AudienceModel,
} from 'adex-models'
import initialState from 'store/initialState'

import { createSelector } from 'reselect'
import { createCachedSelector } from 're-reselect'

export const selectNewItems = state => state.memory.newItem

export const selectNewItemByType = createCachedSelector(
	selectNewItems,
	(_, type) => type,
	(items, type) => items[type]
)((_state, type) => type)

// NOTE: currently used only for existing items update
export const selectNewItemByTypeAndId = createCachedSelector(
	selectNewItems,
	(_, type, itemId) => ({ type, itemId }),
	(items, { type, itemId }) =>
		(itemId ? items[itemId] : items[type]) || { ...initialState.newItem[type] }
)((_state, type, itemId) => `${type}:${itemId}`)

export const selectNewCampaign = createSelector(
	selectNewItems,
	({ Campaign }) => new CampaignModel(Campaign)
)

export const selectNewAdUnit = createSelector(
	selectNewItems,
	({ AdUnit }) => new AdUnitModel(AdUnit)
)

export const selectNewAdSlot = createSelector(
	selectNewItems,
	({ AdSlot }) => new AdSlotModel(AdSlot)
)

export const selectNewAudience = createSelector(
	selectNewItems,
	({ Audience }) => new AudienceModel(Audience)
)

export const selectNewWebsite = createSelector(
	selectNewItems,
	({ Website = {} }) => ({ ...Website })
)
