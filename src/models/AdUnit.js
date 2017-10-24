import Helper from 'helpers/miscHelpers'
import Item from './Item'
import { ItemsTypes, Genders, AdTypes, Sizes, Targets, TargetsWeight, getRandomPropValue } from 'constants/itemsTypes'
import { Images, Locations } from './DummyData'

class AdUnit extends Item {
    constructor(owner, id, ipfs = '', name, { ad_url = '', img, description = '', size = '', adType = '', targets = [] }) {
        super(owner, id, ipfs, ItemsTypes.AdUnit.id, name, img, description)
        let meta = this._meta
        meta.banner = img
        meta.size = size
        meta.adType = adType
        meta.ad_url = ad_url
        meta.targets = targets
    }

    get banner() { return this._meta.banner }
    set banner(value) { this._meta.banner = value }

    get size() { return this._meta.size }
    set size(value) { this._meta.size = value }

    get adType() { return this._meta.adType }
    set adType(value) { this._meta.adType = value }

    set targets(value) { this._meta.targets = value }

    static getRandomInstance(owner, id) {
        let targets = []

        // TODO: This is only for testing data
        // Decide how to handle targets
        for (var index = 0; index < Targets.length; index++) {
            if (Helper.getRandomBool()) {
                var target = Targets[index]
                let value = null
                if (target.values) {
                    value = target.values[Helper.getRandomInt(0, target.values.length - 1)]
                } else if (target.name === 'location') {
                    let locationKey = Helper.getRandomPropFromObj(Locations)
                    value = { value: locationKey, label: Locations[locationKey] }
                } else if (target.name === 'age') {
                    let from = Helper.getRandomInt(0, 100)
                    let to = Helper.getRandomInt(from, 100)
                    value = { from: from, to: to }
                }
                targets.push({
                    name: target.name,
                    value: value,
                    weight: getRandomPropValue(TargetsWeight)
                })
            }
        }

        let unit = new AdUnit(
            owner,
            id,
            '',
            'AdUnit ' + id,
            {
                img: { url: Images[Helper.getRandomInt(0, Images.length - 1)] },
                description: 'AdUnit Description ' + id,
                size: getRandomPropValue(Sizes),
                adType: getRandomPropValue(AdTypes),
                ad_url: 'https://adex.network',
                targets: targets
            }
        )

        return unit
    }

}

export default AdUnit
