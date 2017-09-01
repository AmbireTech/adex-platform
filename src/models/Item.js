import Helper from './tempHelpers'

const ItemTypes = { AdUnit: 'AdUnit', AdSlot: 'AdSlot', Campaign: 'Campaign', Channel: 'Channel' }
const Sizes = { 1: '300x300', 2: '200x200', 3: '100x100', 4: '728x90' }

class Item {
    constructor(owner, type, name){
        this._id = Helper.getGuid()
        this._owner = owner
        this._type = type
        this._name = name
        this._meta = {}  
    }

    static types() {
        return ItemTypes
    }

    static sizes() {
        return Sizes
    }
}

module.exports = Item
