import Helper from './../helpers/miscHelpers'

class Base {
    constructor(name) {
        this._name = Helper.slugify(name)

        this._meta = {
            fullName: name,
            createdOn: Date.now(), // TODO: fix date format
            modifiedOn: null, //
        }
    }

    get name() { return this._name }

    get fullName() { return this._meta.fullName }
    set fullName(value) { this._meta.fullName = value }

    get createdOn() { return this._meta.createdOn }
    set createdOn(value) { this._meta.createdOn = value }

    get modifiedOn() { return this._meta.modifiedOn }
    set modifiedOn(value) { this._meta.modifiedOn = value }

    get meta() { return this._meta }
    // Can we change all meta or validate each with setter ?
    // set meta(value) { this._meta = value }  

    // To use for react reducer when updated in order to not mutate the state
    getClone() {
        return Object.assign(Object.create(this), this)
    }
}

export default Base
