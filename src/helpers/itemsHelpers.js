import { ItemsTypes } from './../constants/itemsTypes'

function sortCollections(items) {
    let collections = {
        campaigns: [],
        adUnits: [],
        channels: [],
        adSlots: []
    }

    for (let i = 0; i < items.length; i++) {
        let item = items[i]
        if(item._type === ItemsTypes.Campaign) collections.campaigns.push(item)
        if(item._type === ItemsTypes.AdUnit) collections.adUnits.push(item)
        if(item._type === ItemsTypes.Channel) collections.channel.push(item)
        if(item._type === ItemsTypes.AdSlot) collections.adSlots.push(item)
    }

    return collections
}

export default {
    sortCollections: sortCollections
}
