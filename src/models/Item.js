// import Helper from './tempHelpers'
import Base from './Base'
class Item extends Base {
    constructor(owner, id, type, name, img, description) {
        super(name)
        this._id = id
        this._owner = owner
        this._type = type
        this._meta.img = img
        this._meta.description = description
        this._meta.archived = false
        this._meta.deleted = false
    }

    get id() { return this._id }
    get owner() { return this._owner }
    get type() { return this._type }

    get img() { return this._meta.img }
    set img(value) { this._meta.img = value }

    get description() { return this._meta.description }
    set description(value) { this._meta.description = value }

    get archived() { return this._meta.archived }
    set archived(value) { this._meta.archived = value }

    get deleted() { return this._meta.deleted }
    set deleted(value) { this._meta.deleted = value }
}

export default Item
