import * as exchange from './exchange'
import * as registry from './registry'
import * as token from './token'
import * as web3 from './web3'
import * as eth from './eth'

export default {
    ...exchange,
    ...registry,
    ...token,
    ...web3,
    ...eth
}
