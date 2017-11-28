// import Helper from './../helpers/miscHelpers'
// import { ItemsTypes } from './../constants/itemsTypes'
import Base from './Base'
class Item extends Base {
    constructor({ _owner = '', _id, _ipfs = '', _type, _name = '', img = { url: null, ipfs: null, type: null, type_id: null }, description = '', _txTime, _txId, _meta = {}, newObj } = {}) {
        super({ _name: _name, _ipfs: _ipfs, _txTime, _txId, _meta: _meta, newObj: newObj })

        this.id = _id
        this._owner = _owner
        this._type = _type
        // this._meta.itemsType = itemsType //TODO: set prop
        this.items = _meta.items || []
        // img.type and img.type_id if at some point we have something different than url ot ipfs and to use type and id to generate the url
        this.img = _meta.img || img
        this.description = _meta.description || description
        this.archived = _meta.archived || false
        this.deleted = _meta.deleted || false
    }

    get id() { return this._id }
    set id(value) { this._id = value || this.txId }
    get owner() { return this._owner }
    get type() { return this._type }

    // get typeName() { return this.getTypeName() }

    // get itemsType() { return this._meta.itemsType }
    get items() { return this._meta.items }
    set items(value) { this._meta.items = value }


    get img() { return this._meta.img }
    set img(value) { this._meta.img = value }

    get imgUrl() {
        this.imgUrlStr(this.img)
    }

    get description() { return this._meta.description }
    set description(value) { this._meta.description = value }

    get archived() { return this._meta.archived }
    set archived(value) { this._meta.archived = value }

    get deleted() { return this._meta.deleted }
    set deleted(value) { this._meta.deleted = value }

    // TODO: item type when add/remove ?
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
