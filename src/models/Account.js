import Helper from './tempHelpers'
import Campaign from './Campaign'
import AdUnit from './AdUnit'
import {ItemsTypes} from './../constants/itemsTypes'

class Account {
    // TODO: accept addr and wallet
    constructor(name){
        this._addr = Helper.getGuid()
        this._items = {}

        for (var key in ItemsTypes) {
            if (ItemsTypes.hasOwnProperty(key)) {
                this._items[ItemsTypes[key].id] = []
            }
        }

        this._addr = Helper.getGuid()
        this._wallet = Helper.getGuid()
        this._name = name
        this._meta = {
            fullName: name
        }

        console.log(this)
    }

    get addr() { return this._addr }
    get items() { return this._items }

    get name() { return this._name }

    get fullName() { return this._meta.fullName }
    set fullName(value) { this._meta.fullName = value }

    get meta() { return this._meta }

    addItem(item) {
        this._items[item._type][item.id] = item
    }

    fillAccountWithRandItems() {
        for (let i = 1; i <= Helper.getRandomInt(2, 20); i++) {
            let camp = Campaign.getRandCampaignInst(this.addr, i)

            this.addItem(camp)

            for (let j = 1; j <= Helper.getRandomInt(2, 20); j++) {
                let id = this.items[ItemsTypes.AdUnit.id].length + 1
                let unit = AdUnit.getRandAdUnitInst(this.addr, id)
                camp.addUnit(unit)
                this.addItem(unit)
            }     
        }
    }

}

export default Account
