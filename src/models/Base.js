import Helper from 'helpers/miscHelpers'

class Base {
    constructor({name = '', ipfs = '', txTime = Date.now()} = {}) {
        this._name = Helper.slugify(name)
        this._ipfs = ipfs;

        this._meta = {
            fullName: name,
            txTime: txTime,
            createdOn: txTime, // TODO: use this or txTime ?
            modifiedOn: txTime
        }
    }

    get name() { return this._name }

    get ipfs() { return this._ipfs }
    set ipfs(value) { this._ipfs = value }

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

    static getImgUrl = img => {
        // TODO: GET ipfs gateway from some config!!!
        if (!img) return null
        if (img.url) return img.url
        if (img.ipfs) return `http://localhost:8080/ipfs/${img.ipfs}`
        if (img.type && img.type_id) {
            switch (img.type) {
                case 'ipfs':
                    return `http://localhost:8080/ipfs/${img.type_id}`
                default: return ''
            }
        }
        if (typeof img === 'string') {
            return img
        }
        // TEMP
        if (img.tempUrl) {
            return img.tempUrl
        }
    }

    static updateMeta(item, meta, dirtyProps) {
        let newItem = { ...item }
        let newMeta = { ...newItem._meta }
        let hasDirtyProps = Array.isArray(dirtyProps)
        if (hasDirtyProps) dirtyProps = [...dirtyProps]

        // TODO: Handle remove key value
        for (let key in meta) {
            if (meta.hasOwnProperty(key) && newMeta.hasOwnProperty(key)) {

                let value = meta[key] //|| newMeta[key]

                if (value instanceof Date) {
                    value = value.getTime()
                }

                newMeta[key] = value

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
