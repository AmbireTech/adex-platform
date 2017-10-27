import Helper from 'helpers/miscHelpers'
import Item from './Item'
import { ItemsTypes, AdTypes, Sizes, getRandomPropValue } from 'constants/itemsTypes'
import { Images } from './DummyData'

class AdSlot extends Item {
    constructor({ owner, id, ipfs, name, img, description, size, adType, location, gender }) {
        super(owner, id, ipfs, ItemsTypes.AdUnit.id, name, img, description)
        let meta = this._meta
        meta.img = img
        meta.description = description
        meta.size = size
        meta.adType = adType
        meta.gender = gender
        meta.bids = []
    }

    get img() { return this._meta.img }
    set img(value) { this._meta.img = value }

    get description() { return this._meta.description }
    set description(value) { this._meta.description = value }

    get size() { return this._meta.size }
    set size(value) { this._meta.size = value }

    get adType() { return this._meta.adType }
    set adType(value) { this._meta.adType = value }

    static getRandomInstance(owner, id) {
        id = id || Helper.getRandomInt(1, 100)

        let slot = new AdSlot(
            {
                owner: owner,
                id: id,
                ipfs: '',
                name: 'Slot ' + id,
                img: { url: Images[Helper.getRandomInt(0, Images.length - 1)] },
                description: 'Slot Description ' + id,
                size: getRandomPropValue(Sizes),
                adType: getRandomPropValue(AdTypes)
            }
        )

        return slot
    }

}

export default AdSlot
