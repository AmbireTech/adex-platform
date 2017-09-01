import Helper from './tempHelpers'
import Campaign from './Campaign'
import AdUnit from './AdUnit'

class Account {
    constructor(name){
        this._id = Helper.getGuid()
        this._items = []
        this._name = name
        this._meta = {}
    }

    get id() { return this._id }
    get items() { return this._items }

    get name() { return this._name }
    set name(value) { this._name = value }

    get meta() { return this._meta }

    addItem(item) {
        this._items.push(item)
    }

    fillAccountWithRandItems() {
        for (let i = 1; i < Helper.getRandomInt(3, 20); i++) {
            let camp = Campaign.getRandCampaignInst(this.id, i)

            this.addItem(camp)

            for (let j = 1; j < Helper.getRandomInt(3, 20); j++) {
                let unit = AdUnit.getRandAdUnitInst(this.id, j)
                camp.addUnit(unit)
                this.addItem(unit)
            }     
        }
    }

}

export default Account
