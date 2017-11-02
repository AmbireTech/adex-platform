import Base from './Base'
import Helper from 'helpers/miscHelpers'
import Campaign from './Campaign'
import AdUnit from './AdUnit'
import { ItemsTypes } from 'constants/itemsTypes'

class Account extends Base {
    // TODO: accept addr and wallet
    constructor(name, addr, wallet) {
        super({name: name})
        this._addr = Helper.getGuid()
        this._wallet = Helper.getGuid()

        this._items = {}

        for (var key in ItemsTypes) {
            if (ItemsTypes.hasOwnProperty(key)) {
                this._items[ItemsTypes[key].id] = []
            }
        }

        // console.log('accoount', this)
    }

    get addr() { return this._addr }
    get allItems() { return this._items }
    get campaigns() { return this._items[ItemsTypes.Campaign.id] }
    get adUnits() { return this._items[ItemsTypes.AdUnit.id] }
    get channels() { return this._items[ItemsTypes.Channel.id] }
    get adSlots() { return this._items[ItemsTypes.AdSlot.id] }
    get meta() { return this._meta }

    // TODO
    addItem(item) {
        this._items[item._type].push(item._id)
    }

}

export default Account
