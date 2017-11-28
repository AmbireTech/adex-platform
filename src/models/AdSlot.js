import Helper from 'helpers/miscHelpers'
import Item from './Item'
import { ItemsTypes, AdTypes, Sizes, getRandomPropValue } from 'constants/itemsTypes'
import { Images } from './DummyData'

class AdSlot extends Item {
    constructor({ _owner, _id, _ipfs, _name, img, description, size, adType, _txTime, _txId, _meta = {}, newObj } = {}) {
        super({
            owner: _owner,
            _id: _id,
            _ipfs: _ipfs,
            _type: ItemsTypes.AdSlot.id,
            _name: _name,
            img: img,
            description: description,
            _txTime: _txTime,
            _txId: _txId,
            _meta: _meta,
            newObj: newObj
        })

        this.size = _meta.size || size
        this.adType = _meta.adType || adType
        this.bids = _meta.bids || []
    }

    get size() { return this._meta.size }
    set size(value) { this._meta.size = value }

    get adType() { return this._meta.adType }
    set adType(value) { this._meta.adType = value }

    get bids() { return this._meta.bids }
    set bids(value) { this._meta.bids = value }

    static getRandomInstance(owner, id) {
        id = id || Helper.getRandomInt(1, 100)

        let slot = new AdSlot(
            {
                _owner: owner,
                _id: id,
                _ipfs: '',
                _name: 'Slot ' + id,
                img: { url: Images[Helper.getRandomInt(0, Images.length - 1)] },
                description: 'Slot Description ' + id,
                size: getRandomPropValue(Sizes),
                adType: getRandomPropValue(AdTypes),
                txTime: Helper.geRandomMoment(60, 60).valueOf()
            }
        )

        return slot
    }

}

export default AdSlot
