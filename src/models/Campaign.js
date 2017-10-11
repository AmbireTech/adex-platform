import Helper from 'helpers/miscHelpers'
import Item from './Item'
import moment from 'moment'
import { ItemsTypes } from 'constants/itemsTypes'
import { Images } from './DummyData'

class Campaign extends Item {
    constructor(owner, id, name = '', { from, to, img = '', description = '' } = {}) {
        super(owner, id, ItemsTypes.Campaign.id, name, img, description)
        this._meta.from = from
        this._meta.to = to
    }

    get from() { return this._meta.from }
    set from(value) { this._meta.from = value }

    get to() { return this._meta.to }
    set to(value) { this._meta.to = value }

    static getRandomInstance(owner, id) {

        let campaign = new Campaign(
            owner,
            id,
            'Campaign ' + id,
            {
                from: moment().add(id, 'd').valueOf(),
                to: moment().add(id + Helper.getRandomInt(3, 10), 'd').valueOf(),
                img: Images[Helper.getRandomInt(0, Images.length - 1)],
                description: 'Campaign Description ' + id
            }
        )

        return campaign
    }
}

export default Campaign
