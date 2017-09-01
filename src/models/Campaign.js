import Helper from './tempHelpers'
import Item from './Item'

class Campaign extends Item {
    constructor(owner, type, name, from, to, img, description){
        super(owner, type, name)
        this._meta.units = []
        this._meta.img = img
        this._meta.description = description
        this._meta.from = from
        this._meta.to = to
    }
}

module.exports = Campaign
