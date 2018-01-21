import Helper from 'helpers/miscHelpers'
import Item from './Item'
import { ItemsTypes, AdTypes, Sizes, getRandomPropValue } from 'constants/itemsTypes'
import { Images } from './DummyData'

class AdSlot extends Item {
    constructor({
        _meta = {},
        fullName,
        owner,
        img,
        size,
        adType,
        _id,
        _ipfs,
        _description,
        _bids,
        _syncedIpfs,
        _deleted,
        _archived
    } = {}) {
        super({
            fullName: fullName,
            owner: owner,
            type: ItemsTypes.AdSlot.id,
            img: img,
            size: size,
            adType: adType,
            _id: _id,
            _ipfs: _ipfs,
            _description: _description,
            _meta: _meta,
            _syncedIpfs: _syncedIpfs
        })

        this.bids = _meta.bids || []
    }

    get bids() { return this._bids }
    set bids(value) { this._bids = value }

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
