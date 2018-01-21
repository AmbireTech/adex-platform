// import Helper from 'helpers/miscHelpers'
import Item from './Item'
import { ItemsTypes } from 'constants/itemsTypes'

class Channel extends Item {
    constructor({
        _owner,
        _id,
        _ipfs,
        _name,
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
            _type: ItemsTypes.Channel.id,
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
    }
}

export default Channel
