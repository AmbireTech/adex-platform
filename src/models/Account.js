import Base from './Base'
import Helper from './../helpers/miscHelpers'
import Campaign from './Campaign'
import AdUnit from './AdUnit'
import { ItemsTypes } from './../constants/itemsTypes'

class Account extends Base {
    // TODO: accept addr and wallet
    constructor(name, addr, wallet) {
        super(name)
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

    addItem(item) {
        this._items[item._type].push(item._id)
    }

    fillAccountWithRandItems() {

        // IMPORTANT: 
        for (let i = 1; i <= Helper.getRandomInt(2, 20); i++) {
            let camp = Campaign.getRandCampaignInst(this.addr, i)

            this.addItem(camp)

            for (let j = 1; j <= Helper.getRandomInt(2, 20); j++) {
                let id = this._items[ItemsTypes.AdUnit.id].length || 1
                let unit = AdUnit.getRandAdUnitInst(this.addr, id)
                camp.addUnit(unit)
                this.addItem(unit)
            }
        }
    }

}

export default Account
