import Promise from 'promise'
import ipfsAPI from 'ipfs-api'
const ipfs = ipfsAPI('localhost', '5001')

export function addImgFromObjectURL(objectUrl) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest()
        console.log('objectUrl from addImgFromObjectURL -> ', objectUrl)
        xhr.open('GET', objectUrl, true)
        xhr.responseType = 'arraybuffer'
        xhr.onload = function (e) {
            if (this.status === 200) {
                var imbBlob = this.response
                const buf = Buffer.from(imbBlob)

                ipfs.files.add(buf, (err, result) => {
                    if (err) {
                        console.error(err)
                        return reject(err)
                    }
                    let url = `http://localhost:8080/ipfs/${result[0].hash}`
                    console.log(`Url --> ${url}`)
                    console.log('result --> ', result)
                    return resolve(result)
                })
            }
        }
        xhr.onerror = function (err) {
            return reject(err)
        }
        xhr.send()
    })
}
