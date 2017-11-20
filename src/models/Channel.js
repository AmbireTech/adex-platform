import Helper from 'helpers/miscHelpers'
import Item from './Item'
import { ItemsTypes } from 'constants/itemsTypes'
import { Images } from './DummyData'

class Channel extends Item {
    constructor({ owner, id, ipfs = '', name = '', from, to, img = {}, description = '', txTime } = {}) {
        super({
            owner: owner,
            id: id,
            ipfs: ipfs,
            type: ItemsTypes.Channel.id,
            name: name,
            img: img,
            description: description,
            txTime: txTime
        })
    }

    static getRandomInstance(owner, id) {
        let channel = new Channel(
            {
                owner: owner,
                id: id,
                ipfs: '',
                name: 'Channel ' + id,
                img: { url: Images[Helper.getRandomInt(0, Images.length - 1)] },
                description: 'Channel Description ' + id,
                txTime: Helper.geRandomMoment(60, 60).valueOf()
            }
        )

        return channel
    }
}

export default Channel
