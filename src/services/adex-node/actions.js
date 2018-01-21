import requester from './requester'
// 
export const uploadImage = ({ imageBlob, imageName = '', userAddr }) => {
    let formData = new FormData()
    formData.append('image', imageBlob, imageName)

    return new Promise((resolve, reject) => {
        requester.fetch({
            route: 'uploadimage',
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

export const regItem = (item, userAddr) => {
    return new Promise((resolve, reject) => {
        requester.fetch({
            route: 'registeritem',
            method: 'POST',
            body: JSON.stringify(item)
        })
            .then((resp) => {
                return resolve(resp.json())
            })
            .catch((err) => {
                return reject(err)
            })

    })
}