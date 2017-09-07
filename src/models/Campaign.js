import Helper from './tempHelpers'
import Item from './Item'
import moment from 'moment'
import {ItemsTypes} from './../constants/itemsTypes'
import {Images} from './DummyData'

class Campaign extends Item {
    constructor(owner, id ,name = '', from, to, img = '', description = ''){
        super(owner, id, ItemsTypes.Campaign.id, name, img, description)
        this._meta.units = []
        this._meta.from = from
        this._meta.to = to
    }

    get units() { return this._meta.units}

    get from() { return this._meta.from }
    set from(value) { this._meta.from = value }

    get to() { return this._meta.to }
    set to(value) { this._meta.to = value }

    addUnit (unit) {
        // TODO: validate everywhere
        this._meta.units.push(unit)
    }

    static getRandCampaignInst(owner, i) {

        let campaign = new Campaign(
            owner, 
            i,
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
