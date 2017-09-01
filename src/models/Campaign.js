import Helper from './tempHelpers'
import Item from './Item'
import moment from 'moment'
import {ItemTypes, Images} from './DummyData'

class Campaign extends Item {
    constructor(owner, name, from, to, img, description){
        super(owner, ItemTypes.Campaign, name)
        this._meta.units = []
        this._meta.img = img
        this._meta.description = description
        this._meta.from = from
        this._meta.to = to
    }

    get units() { return this._meta.units}

    get img() { return this._meta.img }
    set img(value) { this._meta.img = value }

    get description() { return this._meta.description }
    set description(value) { this._meta.description = value }

    get from() { return this._meta.from }
    set from(value) { this._meta.from = value }

    get to() { return this._meta.to }
    set to(value) { this._meta.to = value }

    addUnit (unit) {
        // TODO: validate everywhere
        this._meta.units.push(unit)
    }

    static getRandCampaignInst(owner, i) {
        i = i || Helper.getRandomInt(1, 100)
        
        let campaign = new Campaign(
            owner, 
            'Campaign ' + i, 
            moment().add(i, 'd'),
            moment().add(i + Helper.getRandomInt(3, 10), 'd'),
            Images[Helper.getRandomInt(0, Images.length - 1)],
            'Campaign Description ' + i            
         )

         return campaign
    }
}

export default Campaign
