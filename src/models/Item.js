import Helper from './tempHelpers'

class Item {
    constructor(owner, type, name){
        this._id = Helper.getGuid()
        this._owner = owner
        this._type = type
        this._name = name
        this._meta = {}  
    }

    get id() { return this._id }
    get owner() { return this._owner }
    get type() { return this._type }

    get name() { return this._name }
    set name(value) { this._name = value }

    get meta() { return this._meta }
    // set meta(value) { this._meta = value }
}

export default Item
