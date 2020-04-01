import { items as ItemsConstants } from 'adex-constants'

const { ItemsTypes, AdTypesByValue, AdSizesByValue } = ItemsConstants

export const sortCollections = items => {
	let collections = {
		campaigns: [],
		adUnits: [],
		channels: [],
		adSlots: [],
	}

	for (let i = 0; i < items.length; i++) {
		let item = items[i]
		if (item._type === ItemsTypes.Campaign) collections.campaigns.push(item)
		if (item._type === ItemsTypes.AdUnit) collections.adUnits.push(item)
		if (item._type === ItemsTypes.Channel) collections.channel.push(item)
		if (item._type === ItemsTypes.AdSlot) collections.adSlots.push(item)
	}

	return collections
}

export const cloneObject = obj => {
	return Object.assign(Object.create(obj), obj)
}

export const getTypeName = id => {
	for (var key in ItemsTypes) {
		if (ItemsTypes.hasOwnProperty(key)) {
			if (ItemsTypes[key].id === id) {
				return ItemsTypes[key].name
			}
		}
	}
}

export const groupItemsForCollection = ({ collectionId, allItems = {} }) => {
	let grouped = Object.values(allItems).reduce(
		(memo, item, index) => {
			if (item._items.indexOf(collectionId) > -1) {
				memo.items.push(item)
			} else {
				memo.otherItems.push(item)
			}

			return memo
		},
		{ items: [], otherItems: [] }
	)

	return grouped
}

export const itemAdTypeLabel = ({ adType }) => {
	return (AdTypesByValue[adType] || {}).label
}

export const itemAdSizeLabel = ({ size, t }) => {
	const adSize = AdSizesByValue[size] || {}
	return t(adSize.label, { args: adSize.labelArgs || [] })
}

export const getWidAndHightFromType = type => {
	type = type || 'legacy_300x250'
	if (!type) {
		return {
			width: 0,
			height: 0,
		}
	}

	const sizes = type.split('_')[1].split('x')
	return {
		width: parseInt(sizes[0], 10),
		height: parseInt(sizes[1], 10),
	}
}
