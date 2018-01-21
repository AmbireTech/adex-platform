// import Helper from 'helpers/miscHelpers'
import Item from './Item'
// import moment from 'moment'
import { ItemsTypes } from 'constants/itemsTypes'

class Campaign extends Item {
    constructor({
        _owner,
        _id,
        _ipfs,
        _name,
        from,
        to,
        img,
        description = '',
        _txTime,
        _txId,
        _meta = {},
        newObj,
        _syncedWeb3,
        _syncedIpfs } = {}) {
        super({
            _owner: _owner,
            _id: _id,
            _ipfs: _ipfs,
            _type: ItemsTypes.Campaign.id,
            _name: _name,
            img: img,
            description: description,
            _txTime: _txTime,
            _txId: _txId,
            _meta: _meta,
            newObj: newObj,
            _syncedWeb3: _syncedWeb3,
            _syncedIpfs: _syncedIpfs
        })

        this.from = _meta.from || from
        this.to = _meta.to || to
    }

    get from() { return this._meta.from }
    set from(value) { this._meta.from = value }

    get to() { return this._meta.to }
    set to(value) { this._meta.to = value }
}

export default Campaign
