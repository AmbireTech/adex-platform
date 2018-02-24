import Promise from 'promise'
import ipfsAPI from 'ipfs-api'
import Helper from 'helpers/miscHelpers'

const ipfs = ipfsAPI('localhost', '5001')

export function getFileIpfsHash(file) {
    return new Promise(function (resolve, reject) {

        // return resolve(Helper.getRndHash32('tempnoipfs'))

        let buffer = Buffer.from(file)
        ipfs.files.add(buffer)
            .then(function (result) {
                // console.log('getFileIpfsHash result', result)
                return resolve(result[0].hash)
            })
            .catch(function (err) {
                console.log(err)
                return resolve('error')
            })

    })
}

export function addImgFromObjectURL(objectUrl) {
    return new Promise(function (resolve, reject) {
        // return resolve(Helper.getRndHash32('tempnoipfs'))

        var xhr = new XMLHttpRequest()
        // console.log('objectUrl from addImgFromObjectURL -> ', objectUrl)
        xhr.open('GET', objectUrl, true)
        xhr.responseType = 'arraybuffer'
        xhr.onload = function (e) {
            if (this.status === 200) {
                var imgBlob = this.response
                // TODO: WHY return here to work???
                return resolve(getFileIpfsHash(imgBlob))
            } else {
                // TODO: handle errorsS
                return resolve('error')
            }
        }
        xhr.onerror = function (err) {
            return resolve('error')
        }
        xhr.send()

    })
}
