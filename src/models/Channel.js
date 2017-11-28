import Helper from 'helpers/miscHelpers'
import Item from './Item'
import { ItemsTypes } from 'constants/itemsTypes'
import { Images } from './DummyData'

class Channel extends Item {
    constructor({ _owner, _id, _ipfs, _name, img, description = '', txTime, _meta = {} } = {}) {
        super({
            _owner: _owner,
            _id: _id,
            _ipfs: _ipfs,
            _type: ItemsTypes.Channel.id,
            _name: _name,
            img: img,
            description: description,
            txTime: txTime
        })
    }

    static getRandomInstance(owner, id) {
        let channel = new Channel(
            {
                _owner: owner,
                _id: id,
                _ipfs: '',
                _name: 'Channel ' + id,
                img: { url: Images[Helper.getRandomInt(0, Images.length - 1)] },
                description: 'Channel Description ' + id,
                txTime: Helper.geRandomMoment(60, 60).valueOf()
            }
        )

        return channel
    }
}

export default Channel
