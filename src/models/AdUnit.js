import Helper from './tempHelpers'
import Item from './Item'

class AdUnit extends Item {
    constructor(owner, type, name, from, to, img, description, size, adType, location, gender){
        super(owner, type, name)
        let meta = this._meta
        meta.units = []
        meta.img = img
        meta.description = description
        meta.from = from
        meta.to = to
        meta.adType = adType
        meta.gender = gender
    }
}

module.exports = AdUnit
