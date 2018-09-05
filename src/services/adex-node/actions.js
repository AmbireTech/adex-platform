import requester from './requester'
import { logOut } from 'services/store-data/auth'
import actions from 'actions'
import { translate } from 'services/translations/translations'
import moment from 'moment'

const catchErrors = (res) => {
    return new Promise((resolve, reject) => {
        if (res.status >= 200 && res.status < 400) {
            return resolve(res)
        } else {
            res.text()
                .then((err) => {
                    if (res.status === 401 || res.status === 403) {
                        logOut()
                        // NOTE: In some places this err is handled but its good to have toast always
                        actions.execute(actions.addToast({ type: 'cancel', action: 'X', label: translate('ERR_AUTH', { args: [res.statusText + ' - ' + err] }), timeout: 5000 }))
                    }
                    return reject({ status: res.status, error: res.statusText + ' - ' + err })
                })
        }
    })
}

export const uploadImage = ({ imageBlob, imageName = '', authSig }) => {
    let formData = new FormData()
    formData.append('image', imageBlob, imageName)

    return new Promise((resolve, reject) => {
        requester.fetch({
            route: 'image',
            method: 'POST',
            body: formData,
            authSig: authSig
        })
            .then((resp) => {
                return catchErrors(resp)
            })
            .then((resp) => {
                return resolve(resp.json())
            })
            .catch((err) => {
                return reject(err)
            })
    })
}

const convertItemToJSON = (item) => {
    if (item._from && moment.isMoment(item._from)) {
        item._from = moment.unix(item._from) / 1000
    }

    if (item._to && moment.isMoment(item._to)) {
        item._to = moment.unix(item._to) / 1000
    }

    return JSON.stringify(item)
}

export const regItem = ({ item, authSig }) => {

    // return new Promise((resolve, reject) => {
    return requester.fetch({
        route: 'items',
        method: 'POST',
        body: convertItemToJSON(item),
        authSig: authSig,
        headers: { 'Content-Type': 'application/json' }
    })
        .then((resp) => {
            return catchErrors(resp)
        })
        .then((resp) => {
            return resp.json()
        })
    //         .catch((err) => {
    //             return reject(err)
    //         })
    // })
}

export const getItem = ({ id, authSig }) => {
    return new Promise((resolve, reject) => {
        requester.fetch({
            route: 'items/' + id,
            method: 'GET',
            authSig: authSig
        })
            .then((resp) => {
                return catchErrors(resp)
            })
            .then((resp) => {
                return resolve(resp.json())
            })
            .catch((err) => {
                return reject(err)
            })
    })
}

export const getItems = ({ type, authSig }) => {
    return new Promise((resolve, reject) => {
        requester.fetch({
            route: 'items',
            method: 'GET',
            queryParams: { 'type': type },
            authSig: authSig
        })
            .then((resp) => {
                return catchErrors(resp)
            })
            .then((resp) => {
                return resolve(resp.json())
            })
            .catch((err) => {
                return reject(err)
            })
    })
}

// export const delItem = ({ id, type, authSig }) => {
//     return new Promise((resolve, reject) => {
//         requester.fetch({
//             route: 'items',
//             method: 'DELETE',
//             queryParams: { 'type': type, id: id },
//             authSig: authSig
//         })
//             .then((resp) => {
//                 return catchErrors(resp)
//             })
//             .then((resp) => {
//                 return resolve(resp.json())
//             })
//             .catch((err) => {
//                 return reject(err)
//             })
//     })
// }

export const addItmToItm = ({ item, type, collection, authSig }) => {
    return new Promise((resolve, reject) => {
        requester.fetch({
            route: 'item-to-item',
            method: 'POST',
            authSig: authSig,
            queryParams: { type: type, item: item, collection: collection },
        })
            .then((resp) => {
                return catchErrors(resp)
            })
            .then((resp) => {
                return resolve(resp.json())
            })
            .catch((err) => {
                return reject(err)
            })
    })
}

export const removeItmFromItm = ({ item, type, collection, authSig }) => {
    return new Promise((resolve, reject) => {
        requester.fetch({
            route: 'item-to-item',
            method: 'DELETE',
            authSig: authSig,
            queryParams: { type: type, item: item, collection: collection },
        })
            .then((resp) => {
                return catchErrors(resp)
            })
            .then((resp) => {
                return resolve(resp.json())
            })
            .catch((err) => {
                return reject(err)
            })
    })
}

export const getCollectionItems = ({ id, authSig }) => {
    return new Promise((resolve, reject) => {
        requester.fetch({
            route: 'collection',
            method: 'GET',
            authSig: authSig,
            queryParams: { id: id },
        })
            .then((resp) => {
                return catchErrors(resp)
            })
            .then((resp) => {
                return resolve(resp.json())
            })
            .catch((err) => {
                return reject(err)
            })
    })
}

export const placeBid = ({ bid, unit, authSig }) => {
    return new Promise((resolve, reject) => {
        requester.fetch({
            route: 'bids',
            method: 'POST',
            body: JSON.stringify(bid),
            authSig: authSig,
            headers: { 'Content-Type': 'application/json' }
        })
            .then((resp) => {
                return catchErrors(resp)
            })
            .then((resp) => {
                return resolve(resp.json())
            })
            .catch((err) => {
                return reject(err)
            })
    })
}

const getBids = ({ authSig, query }) => {
    return new Promise((resolve, reject) => {
        requester.fetch({
            route: 'bids',
            method: 'GET',
            authSig: authSig,
            queryParams: query
        })
            .then((resp) => {
                return catchErrors(resp)
            })
            .then((resp) => {
                return resolve(resp.json())
            })
            .catch((err) => {
                return reject(err)
            })
    })
}

export const getUnitBids = ({ authSig, adUnit }) => {
    let query = {
        unit: adUnit
    }

    return getBids({ authSig: authSig, query: query })
}

export const getSlotBids = ({ authSig, adSlot }) => {
    let query = {
        slot: adSlot
    }

    return getBids({ authSig: authSig, query: query })
}

export const getBidsBySide = ({ authSig, side }) => {
    let query = {
        side: side
    }

    return getBids({ authSig: authSig, query: query })
}

export const getAvailableBids = ({ authSig, sizeAndType, tags }) => {
    let query = {
        sizeAndType: sizeAndType,
        tags: tags
    }

    return getBids({ authSig: authSig, query: query })
}

export const getAuthToken = ({ authSig } = {}) => {
    return new Promise((resolve, reject) => {
        requester.fetch({
            route: 'auth',
            method: 'GET'
        })
            .then((resp) => {
                return catchErrors(resp)
            })
            .then((res) => {
                return resolve(res.json())
            })
            .catch((err) => {
                return reject(err)
            })
    })
}

export const signToken = ({ userid, signature, authToken, mode, typedData, hash } = {}) => {
    let data = {
        userid: userid,
        signature: signature,
        authToken: authToken,
        mode: mode,
        typedData: typedData,
        hash: hash
    }

    return new Promise((resolve, reject) => {
        requester.fetch({
            route: 'auth',
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        })
            .then((resp) => {
                return catchErrors(resp)
            })
            .then((res) => {
                return resolve(res.json())
            })
            .catch((err) => {
                return reject(err)
            })
    })
}

export const sendBidState = ({ bidId, state, trHash, authSig }) => {
    let query = {
        bidId: bidId, state: state, trHash: trHash,
    }
    return new Promise((resolve, reject) => {
        requester.fetch({
            route: 'bid-state',
            method: 'POST',
            queryParams: query,
            authSig: authSig
        })
            .then((resp) => {
                return catchErrors(resp)
            })
            .then((resp) => {
                return resolve(resp.json())
            })
            .catch((err) => {
                return reject(err)
            })
    })
}

export const getBidVerificationReport = ({ bidId, authSig }) => {
    let query = {
        bidId: bidId
    }
    return new Promise((resolve, reject) => {
        requester.fetch({
            route: 'bid-report',
            method: 'GET',
            queryParams: query,
            authSig: authSig
        })
            .then((resp) => {
                return catchErrors(resp)
            })
            .then((resp) => {
                return resolve(resp.json())
            })
            .catch((err) => {
                return reject(err)
            })
    })
}

export const checkAuth = ({ authSig }) => {
    return new Promise((resolve, reject) => {
        requester.fetch({
            route: 'auth-check',
            method: 'GET',
            authSig: authSig
        })
            .then((resp) => {
                return catchErrors(resp)
            })
            .then((resp) => {
                return resp.json()
            })
            .then((resp) => {
                if (resp && resp.authenticated) {
                    return resolve(true)
                } else {
                    return reject((resp || {}).error || 'Authentication error')
                }
            })
            .catch((err) => {
                return reject(err)
            })
    })
}

export const updateItm = ({ item, authSig }) => {
    return requester.fetch({
        route: 'items',
        method: 'PUT',
        body: convertItemToJSON(item),
        authSig: authSig,
        headers: { 'Content-Type': 'application/json' }
    })
        .then((resp) => {
            return catchErrors(resp)
        })
        .then((resp) => {
            return resp.json()
        })
}

export const getBidEvents = ({ eventData = { bids: null, bid: null, start: null, end: null, interval: null } } = {}) => {
    return requester.fetch({
        route: 'events',
        method: 'GET',
        queryParams: eventData,
        headers: { 'Content-Type': 'application/json' }
    })
        .then((resp) => {
            return catchErrors(resp)
        })
        .then((resp) => {
            return resp.json()
        })
        .then(resp => {
            return resp
        })
}

export const getTags = () => {
    return requester.fetch({
        route: 'tags',
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then((resp) => {
        return catchErrors(resp)
    })
    .then((resp) => {
        return resp.json()
    })
}