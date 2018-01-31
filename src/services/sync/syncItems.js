// NOTE: Sync store items

import { getAccountItems, getItemsByType } from 'services/smart-contracts/actions/registry'
import { Item, Base } from 'adex-models'
import { Models } from 'adex-models'

export const syncStoreItemsByType = ({ storeItems, type, owner } = {}) => {
    return syncStoreItemsWithWebAndIpfs({ storeItems, type, owner })
}

const syncStoreItemsWithWebAndIpfs = ({ storeItems, type, owner }) => {
    return new Promise((resolve, reject) => {
        let web3ItemsSyncedMemo

        getAccountItems({ _addr: owner, _type: type })
            .then((res) => {
                getItemsByType({ _type: type, itemsIds: res })
                    .then((web3Items) => {
                        //TEMP
                        let items = web3Items.map((w3i) => {
                            w3i._meta = w3i._metaWeb3
                            return new Item(w3i)
                        })

                        return items
                    })
                    .then((web3Items) => {
                        let syncedItemsWithWeb3 = syncWeb3AndStoreItems(web3Items, storeItems, owner)
                        web3ItemsSyncedMemo = syncedItemsWithWeb3
                        return syncedItemsWithWeb3
                    })
                    .then((items) => {
                        let allMetas = []
                        for (let index = 0; index < items.length; index++) {
                            const ipfs = items[index]._ipfs
                            allMetas.push(fetch(Base.getIpfsMetaUrl(ipfs)))
                        }

                        return Promise.all(allMetas)
                    })
                    .then((metaas) => {
                        let mapped = metaas.map((res) => {
                            let body = res.json()

                            return body
                        })

                        return Promise.all(mapped)
                    })
                    .then((results) => {
                        let updated = syncItemsIpfsMeta(web3ItemsSyncedMemo, results)

                        return resolve(updated)
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })
    })

}

const syncWeb3AndStoreItems = (web3Items, storeItems, owner) => {
    let syncedItems = []
    let length

    // TEMP: filter here by owner until we keep the items by user in the local storage
    // TODO: Decide if we should delete the local storage items of one user if other logs in the same browser 
    web3Items = (web3Items || []).filter(item => item._owner.toLowerCase() === owner.toLowerCase())
    storeItems = (Array.from(Object.values(storeItems || {})) || []).filter(item => item._owner.toLowerCase() === owner.toLowerCase())
    length = web3Items.length > storeItems.length ? web3Items.length : storeItems.length

    storeItems = storeItems.reduce((memo, item, index) => {
        let key = item._id || item._ipfs
        memo[key] = item
        return memo
    }, {})

    for (let index = 0; index < length; index++) {
        let web3Item = web3Items[index]
        let storeItem = web3Item ? (storeItems[web3Item._id] || storeItems[web3Item._ipfs]) : storeItems[index]

        if (storeItem) {
            let synced = Item.syncWithWeb3(storeItem, web3Item)

            syncedItems.push(synced)
        } else if (web3Item) {
            syncedItems.push(web3Item)
        }
    }

    return syncedItems
}

const syncItemsIpfsMeta = (items, metas) => {
    if (!items || !metas || (items.length !== metas.length)) throw ('Sync ipfs meta err')

    let synced = []
    for (let index = 0; index < items.length; index++) {
        let item = { ...items[index] }
        let meta = { ...metas[index] }

        let ownProps = { syncedIpfs: true }

        let updated = Base.updateObject({ item: item, ownProps: ownProps, meta: meta, objModel: Models.itemClassByTypeId[item._type] })
        synced.push(updated)
    }

    return synced
}