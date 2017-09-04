import Account from './../models/Account'
import objectAssign from 'object-assign';

let cache = null;

function GenerateAccount() {
    if(cache) return cache

    let acc = new Account('John Smith')
    acc.fillAccountWithRandItems()
    let clean = objectAssign({}, acc)
    let cleanItems = [...clean._items]
    clean._items = cleanItems

    cache = clean
    return clean
}

export default {
    account: GenerateAccount()
}
