import { ItemsTypes } from 'constants/itemsTypes'

export const sortCollections = (items) => {
    let collections = {
        campaigns: [],
        adUnits: [],
        channels: [],
        adSlots: []
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

export const cloneObject = (obj) => {
    return Object.assign(Object.create(obj), obj)
}

export const getTypeName = (id) => {
    for (var key in ItemsTypes) {
        if (ItemsTypes.hasOwnProperty(key)) {
            if (ItemsTypes[key].id === id) {
                return ItemsTypes[key].name
            }
        }
    }
}

export const groupItemsForCollection = ({ collectionId, allItems = {} }) => {

    let grouped = Array.from(Object.values(allItems))
        .reduce((memo, item, index) => {
            if (item._items.indexOf(collectionId) > -1) {
                memo.items.push(item)
            } else {
                memo.otherItems.push(item)
            }

            return memo
        }, { items: [], otherItems: [] })

    return grouped
}