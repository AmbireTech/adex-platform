import Account from './../models/Account'

let cache = null;

function GenerateAccount() {
    if(cache) return cache

    let acc = new Account('John Smith')
    acc.fillAccountWithRandItems()
    console.log('acc', acc)
    cache = acc
    return acc
}

export default {
    account: GenerateAccount()
}
