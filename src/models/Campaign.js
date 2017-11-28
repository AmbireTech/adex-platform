import Helper from 'helpers/miscHelpers'
import Item from './Item'
import moment from 'moment'
import { ItemsTypes } from 'constants/itemsTypes'
import { Images } from './DummyData'

class Campaign extends Item {
    constructor({ _owner, _id, _ipfs, _name, from, to, img, description = '', txTime, _meta = {} } = {}) {
        super({
            _owner: _owner,
            _id: _id,
            _ipfs: _ipfs,
            _type: ItemsTypes.Campaign.id,
            _name: _name,
            img: img,
            description: description,
            txTime: txTime
        })

        this.from = _meta.from || from
        this.to = _meta.to || to
    }

    get from() { return this._meta.from }
    set from(value) { this._meta.from = value }

    get to() { return this._meta.to }
    set to(value) { this._meta.to = value }

    static getRandomInstance(owner, id) {

        let campaign = new Campaign(
            {
                _owner: owner,
                _id: id,
                _ipfs: '',
                _name: 'Campaign ' + id,
                from: moment().add(id, 'd').valueOf(),
                to: moment().add(id + Helper.getRandomInt(3, 10), 'd').valueOf(),
                img: { url: Images[Helper.getRandomInt(0, Images.length - 1)] },
                description: 'Campaign Description ' + id,
                txTime: Helper.geRandomMoment(60, 60).valueOf()
            }
        )

        return campaign
    }
}

export default Campaign
