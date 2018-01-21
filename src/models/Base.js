import Helper from 'helpers/miscHelpers'

/**
 * NOTE: We use _meta as constructor argument in order to make new instances of the object from plain objects
 * and use validations with setters but keep plain object in redux store
 */
class Base {
    constructor({ fullName = '', _ipfs = '', _meta = {}, _syncedIpfs = false, _modifiedOn, _deleted, _archived } = {}) {
        /**
         * NOTE: The meta field is the one saved into ipfs and it cannot be changed
         * ipfs field will corresponding to the value of meta field
         *  meta and ipfs field should not be changed because the exchange bits will keep the ipfs hash of the meta field
         */
        this._meta = {}

        this.name = _meta.name || fullName
        this.fullName = fullName || _meta.fullName
        this.createdOn = _meta.createdOn

        /**
         * NOTE: props only available on the UI/anex-node
         */

        this.ipfs = _ipfs
        this.modifiedOn = _modifiedOn
        this.syncedIpfs = _syncedIpfs
        this.deleted = _deleted || false
        this.archived = _archived || false
    }

    // Meta (ipfs) props (can NOT be changed)
    get meta() { return this._meta }

    get createdOn() { return this._meta.createdOn }
    set createdOn(value) { this._meta.createdOn = value }

    //TODO: Do we need this slugified name?
    get name() { return this._meta.name }
    set name(value) { this._meta.name = Helper.slugify(value) }

    get fullName() { return this._meta.fullName }
    set fullName(value) { this._meta.fullName = value }

    // Dapp/adex-node fields (can be changed)
    get ipfs() { return this._ipfs };
    set ipfs(value) { this._ipfs = value }

    get modifiedOn() { return this._modifiedOn }
    set modifiedOn(value) { this._modifiedOn = value }

    get archived() { return this._archived }
    set archived(value) { this._archived = value }

    get deleted() { return this._deleted }
    set deleted(value) { this._deleted = value }

    get syncedIpfs() { return this._syncedIpfs }
    set syncedIpfs(value) { this._syncedIpfs = value }

    // get syncedAdexNode() { return this._syncedAdexNode }
    // set syncedAdexNode(value) { this._syncedAdexNode = value }

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

    static getIpfsMetaUrl = ipfs => {
        let url = `http://localhost:8080/ipfs/${ipfs}`

        return url
    }

    // TODO: make it recursive for all props
    static updateObject({ item = {}, ownProps = {}, meta = {}, objModel = Base, dirtyProps } = {}) {
        meta = { ...meta, ...ownProps } //TEMP

        let newItem = new objModel(item)

        // console.log('newItem', newItem)
        let hasDirtyProps = Array.isArray(dirtyProps)
        if (hasDirtyProps) dirtyProps = [...dirtyProps]

        newItem['kor'] = 'hoi'

        // TODO: Handle remove key value
        for (let key in meta) {
            if (meta.hasOwnProperty(key) && key in newItem) {

                let value = meta[key]

                if (value instanceof Date) {
                    value = value.getTime()
                }

                newItem[key] = value

                if (hasDirtyProps && dirtyProps.indexOf(key) < 0) {
                    dirtyProps.push(key)
                }
            }
        }

        newItem.modifiedOn = Date.now()
        newItem.dirtyProps = dirtyProps
        let plainObj = newItem.plainObj()

        return plainObj
    }

    // TODO: remove this
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
