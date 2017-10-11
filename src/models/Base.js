import Helper from 'helpers/miscHelpers'

class Base {
    constructor(name = '') {
        this._name = Helper.slugify(name)

        let now = Date.now()

        // TODO: add _ipfs prop!!!!
        this._meta = {
            fullName: name,
            createdOn: now, // TODO: fix date format
            modifiedOn: now, // 
        }
    }

    get name() { return this._name }

    get fullName() { return this._meta.fullName }
    set fullName(value) { this._meta.fullName = value }

    get createdOn() { return this._meta.createdOn }
    set createdOn(value) { this._meta.createdOn = value }

    get modifiedOn() { return this._meta.modifiedOn }
    set modifiedOn(value) { this._meta.modifiedOn = value }

    get meta() { return this._meta }
    // Can we change all meta or validate each with setter ?
    // set meta(value) { this._meta = value }  

    plainObj() {
        return { ...this }
    }

    static updateMeta(item, meta, dirtyProps) {
        let newItem = { ...item }
        let newMeta = { ...newItem._meta }
        let hasDirtyProps = Array.isArray(dirtyProps)
        if (hasDirtyProps) dirtyProps = [...dirtyProps]

        // TODO: Handle remove key value
        for (var key in meta) {
            if (meta.hasOwnProperty(key) && newMeta.hasOwnProperty(key)) {
                newMeta[key] = meta[key] //|| newMeta[key]

                if (hasDirtyProps && dirtyProps.indexOf(key) < 0) {
                    dirtyProps.push(key)
                }
            }
        }

        newItem.dirtyProps = dirtyProps
        newItem._meta = newMeta

        return newItem
    }
}

export default Base
