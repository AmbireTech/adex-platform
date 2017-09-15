// import Helper from './../helpers/miscHelpers'
// import { ItemsTypes } from './../constants/itemsTypes'
import Base from './Base'
class Item extends Base {
    constructor(owner, id, type, name = '', img = '', description = '') {
        super(name)
        this._id = id
        this._owner = owner
        this._type = type
        // this._meta.itemsType = itemsType //TODO: set prop
        this._meta.items = []
        this._meta.img = img
        this._meta.description = description
        this._meta.archived = false
        this._meta.deleted = false
    }

    get id() { return this._id }
    get owner() { return this._owner }
    get type() { return this._type }

    // get typeName() { return this.getTypeName() }

    // get itemsType() { return this._meta.itemsType }
    get items() { return this._meta.items }

    get img() { return this._meta.img }
    set img(value) { this._meta.img = value }

    get description() { return this._meta.description }
    set description(value) { this._meta.description = value }

    get archived() { return this._meta.archived }
    set archived(value) { this._meta.archived = value }

    get deleted() { return this._meta.deleted }
    set deleted(value) { this._meta.deleted = value }

    //TODO: item type when add/remove ?
    static addItem(item, toAdd) {
        if (toAdd._id) toAdd = toAdd._id

        let itemIndex = item._meta.items.indexOf(toAdd)
        if (itemIndex > -1) return

        let newItem = { ...item }
        let newMeta = { ...newItem._meta }
        let newItems = [...newItem._meta.items]
        newItems.push(toAdd)
        newMeta.items = newItems
        newMeta.modifiedOn = Date.now()
        newItem._meta = newMeta

        return newItem
    }

    static removeItem(item, toRemove) {
        if (toRemove._id) toRemove = toRemove._id

        let itemIndex = item._meta.items.indexOf(toRemove)        
        if (itemIndex < 0) return

        let newItem = { ...item }
        let newMeta = { ...newItem._meta }
        let newItems = [...newItem._meta.items]
        newItems.splice(itemIndex, 1)
        newMeta.items = newItems
        newMeta.modifiedOn = Date.now()
        newItem._meta = newMeta

        return newItem
    }
}

export default Item
