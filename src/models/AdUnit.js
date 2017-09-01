import Helper from './tempHelpers'
import Item from './Item'
import {ItemTypes, Sizes, Images, AdTypes, Locations, Genders} from './DummyData'

class AdUnit extends Item {
    constructor(owner, name, img, description, size, adType, location, gender){
        super(owner, ItemTypes.AdUnit, name)
        let meta = this._meta
        meta.img = img
        meta.description = description
        meta.adType = adType
        meta.gender = gender
    }

    get img() { return this._meta.img }
    set img(value) { this._meta.img = value }

    get description() { return this._meta.description }
    set description(value) { this._meta.description = value }

    get adType() { return this._meta.adType }
    set adType(value) { this._meta.adType = value }

    get gender() { return this._meta.gender }
    set gender(value) { this._meta.gender = value }

    static getRandAdUnitInst(owner, i) {
        i = i || Helper.getRandomInt(1, 100)

        let unit = new AdUnit(
            owner, 
            'AdUnit ' + i, 
            Images[Helper.getRandomInt(0, Images.length - 1)],
            'AdUnit Description ' + i,
            Helper.getRandomPropFromObj(Sizes),   
            Helper.getRandomPropFromObj(AdTypes),   
            Helper.getRandomPropFromObj(Locations),          
            Helper.getRandomPropFromObj(Genders)
         )

         return unit
    }

}

export default AdUnit
