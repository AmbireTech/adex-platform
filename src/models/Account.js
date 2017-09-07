import Helper from './tempHelpers'
import Campaign from './Campaign'
import AdUnit from './AdUnit'

class Account {
    // TODO: accept addr and wallet
    constructor(name){
        this._addr = Helper.getGuid()
        this._items = {
            0: [],
            1: [],
            2: [],
            3: []
        }
        this._addr = Helper.getGuid()
        this._wallet = Helper.getGuid()
        this._name = name
        this._meta = {
            fullName: name
        }
    }

    get addr() { return this._addr }
    get items() { return this._items }

    get name() { return this._name }

    get fullName() { return this._meta.fullName }
    set fullName(value) { this._meta.fullName = value }

    get meta() { return this._meta }

    addItem(item) {



        this._items.push(item)
    }

    fillAccountWithRandItems() {
        for (let i = 1; i <= Helper.getRandomInt(2, 20); i++) {
            let camp = Campaign.getRandCampaignInst(this.id, i)

            this.addItem(camp)

            for (let j = 1; j <= Helper.getRandomInt(2, 20); j++) {
                let unit = AdUnit.getRandAdUnitInst(this.id, j)
                camp.addUnit(unit)
                this.addItem(unit)
            }     
        }
    }

}

export default Account
