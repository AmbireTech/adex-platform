import Helper from 'helpers/miscHelpers'
import Item from './Item'
import { ItemsTypes, Genders, AdTypes, Sizes, Targets, TargetsWeight, getRandomPropValue, Locations } from 'constants/itemsTypes'
import { Images } from './DummyData'

class AdUnit extends Item {
    constructor({ _owner, _id, _ipfs, _name, ad_url = '', img, description = '', size = '', adType = '', targets = [], _txTime, _txId, _meta = {} } = {}) {
        super({
            _owner: _owner,
            _id: _id,
            _ipfs: _ipfs,
            _type: ItemsTypes.AdUnit.id,
            _name: _name,
            img: img,
            description: description,
            _txTime: _txTime,
            _txId: _txId,
            _meta: _meta
        })

        this.banner = _meta.banner || img
        this.size = _meta.size || size
        this.adType = _meta.adType || adType
        this.ad_url = _meta.ad_url || ad_url
        this.targets = _meta.targets || targets
    }

    get banner() { return this._meta.banner }
    set banner(value) { this._meta.banner = value }

    get size() { return this._meta.size }
    set size(value) { this._meta.size = value }

    get adType() { return this._meta.adType }
    set adType(value) { this._meta.adType = value }

    get ad_url() { return this._meta.ad_url }
    set ad_url(value) { this._meta.ad_url = value }

    get targets() { return this._meta.targets }
    set targets(value) { this._meta.targets = value }

    static updateTargets(targets, target, newValue, newWeight) {
        // TODO: validate target
        target = { ...target }
        target.value = newValue
        if (!!newWeight || (newWeight === 0)) {
            target.weight = newWeight
        }

        targets = [...targets]
        let hasThisTarget = false

        for (let i = 0; i < targets.length; i++) {
            let currentTarget = targets[i]
            if (currentTarget.name === target.name) {
                targets[i] = target
                hasThisTarget = true
                break
            }
        }

        if (!hasThisTarget) targets.push(target)

        return targets
    }

    static updateTargetsWeight(targets, target, newWeight) {
        // TODO: validate target
        target = { ...target }
        target.weight = newWeight

        targets = [...targets]
        let hasThisTarget = false

        for (let i = 0; i < targets.length; i++) {
            let currentTarget = targets[i]
            if (currentTarget.name === target.name) {
                targets[i] = target
                hasThisTarget = true
                break
            }
        }

        if (!hasThisTarget) targets.push(target)

        return targets
    }

    static getRandomInstance(owner, id) {
        let targets = []

        // TODO: This is only for testing data
        // Decide how to handle targets
        for (var index = 0; index < Targets.length; index++) {
            // if (Helper.getRandomBool()) {
            var target = Targets[index]
            let value = null
            if (target.values) {
                value = target.values[Helper.getRandomInt(0, target.values.length - 1)]
            } else if (target.name === 'location') {
                let locationKey = getRandomPropValue(Locations)
                value = { value: [locationKey], label: Locations[locationKey] }
            } else if (target.name === 'age') {
                let from = Helper.getRandomInt(0, 100)
                let to = Helper.getRandomInt(from, 100)
                value = { from: from, to: to }
            }
            targets.push({
                name: target.name,
                value: value.value ? [value.value] : value,
                weight: getRandomPropValue(TargetsWeight)
            })
            // }
        }

        let unit = new AdUnit(
            {
                _owner: owner,
                _id: id,
                _ipfs: '',
                _name: 'AdUnit ' + id,
                img: { url: Images[Helper.getRandomInt(0, Images.length - 1)] },
                description: 'AdUnit Description ' + id,
                size: getRandomPropValue(Sizes),
                adType: getRandomPropValue(AdTypes),
                ad_url: 'https://adex.network',
                targets: targets,
                txTime: Helper.geRandomMoment(60, 60).valueOf()
            }
        )

        return unit
    }

}

export default AdUnit
