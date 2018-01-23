import requester from './requester'

export const uploadImage = ({ imageBlob, imageName = '', userAddr }) => {
    let formData = new FormData()
    formData.append('image', imageBlob, imageName)

    return new Promise((resolve, reject) => {
        requester.fetch({
            route: 'image',
            method: 'POST',
            body: formData,
            userAddr: userAddr
        })
            .then((resp) => {
                return resolve(resp.json())
            })
            .catch((err) => {
                return reject(err)
            })
    })
}

export const regItem = ({ item, userAddr }) => {
    return new Promise((resolve, reject) => {
        requester.fetch({
            route: 'items',
            method: 'POST',
            body: JSON.stringify(item),
            userAddr: userAddr,
            headers: { 'Content-Type': 'application/json' }
        })
            .then((resp) => {
                return resolve(resp.json())
            })
            .catch((err) => {
                return reject(err)
            })

    })
}

export const getItems = ({ type, userAddr }) => {
    return new Promise((resolve, reject) => {
        requester.fetch({
            route: 'items',
            method: 'GET',
            queryParams: { 'type': type },
            userAddr: userAddr
        })
            .then((resp) => {
                return resolve(resp.json())
            })
            .catch((err) => {
                return reject(err)
            })

    })
}

export const delItem = ({ id, type, userAddr }) => {
    return new Promise((resolve, reject) => {
        requester.fetch({
            route: 'items',
            method: 'DELETE',
            queryParams: { 'type': type, id: id },
            userAddr: userAddr
        })
            .then((resp) => {
                return resolve(resp.json())
            })
            .catch((err) => {
                return reject(err)
            })
    })
}