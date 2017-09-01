import Helper from './tempHelpers'

class Account {
    constructor(name){
        this.id = Helper.getGuid()
        this.items = []
        this.name = name
        this.meta = {}
    }
}

module.exports = Account
