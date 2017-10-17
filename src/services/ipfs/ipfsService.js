import ipfsAPI from 'ipfs-api'
const ipfs = ipfsAPI('localhost', '5001')

export function addImgFromObjectURL(objectUrl) {

    var xhr = new XMLHttpRequest()
    xhr.open('GET', objectUrl, true)
    xhr.responseType = 'arraybuffer'
    xhr.onload = function (e) {
        if (this.status === 200) {
            var imbBlob = this.imbBlob
            console.log('imbBlob', imbBlob)

            const buf = Buffer.from(imbBlob)
            console.log('buf', buf)
            ipfs.add(buf, (err, result) => {
                if (err) {
                    console.error(err)
                    return
                }
                let url = `http://localhost:8080/ipfs/${result[0].hash}`
                console.log(`Url --> ${url}`)
                console.log('result --> ', result)
            })
        }
    }
    xhr.send()
}
