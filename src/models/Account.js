import Base from './Base'
import Helper from 'helpers/miscHelpers'
import { ItemsTypes } from 'constants/itemsTypes'
import { fromHexParam } from 'services/smart-contracts/utils'

class Account extends Base {
    /**
    * NOTE:
    *   - _temp prop will be used for easy development at the moment to keep account data
    *   - _stats will be used only at the client model for easier access to account data from 
    *   smart contracts (balance of rth/adx, register status, approved adx for transfer etc...)        
    */
    constructor({ _name, _addr, _wallet, _ipfs, _meta, _temp, _stats = { balanceEth: 0, balanceAdx: 0, allowance: 0, isRegistered: false } }) {
        super({ _name, _meta, _ipfs })
        this._addr = _addr || Helper.getGuid()
        this._wallet = _wallet || _addr
        this._stats = _stats

        this._items = {}

        for (var key in ItemsTypes) {
            if (ItemsTypes.hasOwnProperty(key)) {
                this._items[ItemsTypes[key].id] = []
            }
        }

        // Temp we will keep here some addr data 
        this._temp = _temp

        // console.log('accoount', this)
    }

    get addr() { return this._addr }
    set addr(value) { this._addr = value }

    get items() { return this._items }
    set items(value) { this._items = value }

    get campaigns() { return this._items[ItemsTypes.Campaign.id] }
    get adUnits() { return this._items[ItemsTypes.AdUnit.id] }
    get channels() { return this._items[ItemsTypes.Channel.id] }
    get adSlots() { return this._items[ItemsTypes.AdSlot.id] }

    get stats() { return this._stats }
    set stats(value) { this._stats = value }

    get temp() { return this._temp }
    set temp(value) { this._temp = value }

    // TODO
    addItem(item) {
        this._items[item._type].push(item._id)
    }

    static decodeFromWeb3(accWeb3) {
        let acc = {}
        acc._name = fromHexParam(accWeb3['accountName'] || accWeb3[3], 'string')
        acc._ipfs = fromHexParam(accWeb3['ipfs'], 'string')
        acc._metaWeb3 = fromHexParam(accWeb3['meta'] || accWeb3[4], 'string')
        acc._addr = accWeb3['addr'] || accWeb3[0]
        acc._wallet = accWeb3['wallet'] || accWeb3[1]

        return acc
    }
}

export default Account
