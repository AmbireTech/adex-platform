import Helper from 'helpers/miscHelpers'
import Item from './Item'
import { ItemsTypes } from 'constants/itemsTypes'
import { Images } from './DummyData'

class Channel extends Item {
    constructor({ owner, id, ipfs = '', name = '', from, to, img = {}, description = '' } = {}) {
        super(owner, id, ipfs, ItemsTypes.Campaign.id, name, img, description)
    }

    static getRandomInstance(owner, id) {
        let channel = new Channel(
            {
                owner: owner,
                id: id,
                ipfs: '',
                name: 'Channel ' + id,
                img: { url: Images[Helper.getRandomInt(0, Images.length - 1)] },
                description: 'Channel Description ' + id
            }
        )

        return channel
    }
}

export default Channel
