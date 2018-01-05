import Helper from 'helpers/miscHelpers'

/**
 * NOTE: We use _meta as constructor argument in order to make new instances of the object from plain objects
 * and use validations with setters but keep plain object in redux store
 */
class Base {
    constructor({ _name = '', _ipfs = '', _txTime, _txId, _meta = {}, newObj, _syncedWeb3 = false, _syncedIpfs = false } = {}) {
        let name = _name || _meta.fullName || ''
        this.name = name
        this.ipfs = _ipfs

        this._meta = {}

        if (newObj) {
            _txId = _txId || Helper.getGuid()
            _txTime = _txTime || Date.now()
        }
        this.txId = _txId
        this.txTime = _txTime
        this.fullName = _meta.fullName || _name
        this.createdOn = _meta.createdOn || this.txTime
        this.modifiedOn = _meta.modifiedOn || this.txTime
        this.syncedWeb3 = _syncedWeb3
        this.syncedIpfs = _syncedIpfs
    }

    /**
     * NOTE: We use this meta prop to track the items when they are synced with web3 and ipfs.
     * The UI is updated before the sync and Id's are unknown until the sync
     * TODO: Use ipfs to track not synced items (Temp helper guid)
     */
    get txId() { return this._txId }
    set txId(value) { this._txId = value }

    get txTime() { return this._txTime }
    set txTime(value) { this._txTime = value }

    get syncedWeb3() { return this._syncedWeb3 }
    set syncedWeb3(value) { this._syncedWeb3 = value }

    get syncedIpfse() { return this._syncedIpfs }
    set syncedIpfs(value) { this._syncedIpfs = value }

    get name() { return this._name }
    set name(value) { this._name = Helper.slugify(value) }

    get ipfs() { return this._ipfs };
    set ipfs(value) { this._ipfs = value }

    get fullName() { return this._meta.fullName }
    set fullName(value) { this._meta.fullName = value }

    get createdOn() { return this._meta.createdOn }
    set createdOn(value) { this._meta.createdOn = value }

    get modifiedOn() { return this._meta.modifiedOn }
    set modifiedOn(value) { this._meta.modifiedOn = value }

    get meta() { return this._meta }

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

    // TODO: make it recursive for all props
    static updateObject({ item = {}, ownProps = {}, meta = {}, objModel = Base, dirtyProps } = {}) {

        let newItem = new objModel(item)

        // console.log('newItem', newItem)
        let hasDirtyProps = Array.isArray(dirtyProps)
        if (hasDirtyProps) dirtyProps = [...dirtyProps]

        // TODO: Handle remove key value
        for (let key in meta) {
            if (meta.hasOwnProperty(key) && newItem._meta.hasOwnProperty(key)) {

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

        // TODO: check new item for setter
        for (let key in ownProps) {

            if (ownProps[key]) {

                let value = ownProps[key]

                if (value instanceof Date) {
                    value = value.getTime()
                }

                newItem[key] = value

                // TODO: distinct meta and own props if needed
                if (hasDirtyProps && dirtyProps.indexOf(key) < 0) {
                    dirtyProps.push(key)
                }
            }
        }

        newItem.modifiedOn = Date.now()

        newItem.dirtyProps = dirtyProps

        let plainObj = newItem.plainObj()
        // console.log('plainObj', plainObj)
        return plainObj
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
