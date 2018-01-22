// import Helper from './../helpers/miscHelpers'
import { ItemModelsByType } from 'constants/itemsTypes'

import Base from './Base'

// ITEM will be AdSlot or AdUnit (Channel/Campaign will be collections)
class Item extends Base {
    constructor({
        _meta = {},
        fullName,
        owner = '',
        type,
        img = { url: null, ipfs: null, type: null, type_id: null }, // TODO: fix img props
        size,
        adType,
        _description = '',
        _id = '',
        _ipfs = '',
        _modifiedOn,
        _syncedIpfs,
        _deleted,
        _archived,
        _items
        } = {}) {
        super({
            fullName: fullName,
            _ipfs: _ipfs,
            _meta: _meta,
            _syncedIpfs: _syncedIpfs,
            _modifiedOn: _modifiedOn,
            _deleted: _deleted,
            _archived: _archived
        })

        this.owner = _meta.owner || owner //TODO: set this on the node?
        this.type = _meta.type || type
        this.img = _meta.img || img
        this.size = _meta.size || size
        this.adType = _meta.adType || adType

        this.id = _id
        this.items = _items || []
        this.description = _description
    }

    // Meta (ipfs) props (can NOT be changed)
    get owner() { return this._meta.owner }
    set owner(value) { this._meta.owner = value }

    get type() { return this._meta.type }
    set type(value) {
        this._meta.type = value
        this._type = value // TEMP: to keep the UI working
    }

    get img() { return this._meta.img }
    set img(value) { this._meta.img = value }

    get size() { return this._meta.size }
    set size(value) { this._meta.size = value }

    get adType() { return this._meta.adType }
    set adType(value) { this._meta.adType = value }

    // Dapp/adex-node fields (can be changed)
    get id() { return this._id }
    set id(value) { this._id = value }

    // Description only visible for the owner
    get description() { return this._description }
    set description(value) { this._description = value }

    get collections() { return this._collections }
    set collections(value) { this._collections = value }

    get items() { return this._items }
    set items(value) { this._items = value }

    // UI props    
    get imgUrl() {
        this.imgUrlStr(this.img)
    }

    // TODO: change it to work with the new models
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
