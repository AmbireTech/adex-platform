/**
 * @param {String} objUrl - Image blob url URL.createObjectURL
 * @param {Object} pixelCrop - pixelCrop Object provided by react-image-crop
 * @param {String} fileName - Name of the returned file in Promise
 */
export const getCroppedImgUrl = (objUrl, pixelCrop, fileName) => {
    const canvas = document.createElement('canvas')

    let img = new Image()
    img.src = objUrl
  
    // As a blob
    return new Promise((resolve, reject) => {
        img.onload = () => {
            let width = img.width
            let height = img.height

            // pixelCrop come in %
            let crop = {
                x: width * (pixelCrop.x / 100),
                y: height * (pixelCrop.y / 100),
                width: width * (pixelCrop.width / 100),
                height: height * (pixelCrop.height / 100),
            }

            canvas.width = crop.width
            canvas.height = crop.height
            const ctx = canvas.getContext('2d')        

            // console.log('crop', crop)
            // console.log('width', width)
            // console.log('height', height)

            ctx.drawImage(
                img,
                crop.x,
                crop.y,
                crop.width,
                crop.height,
                0,
                0,
                crop.width,
                crop.height
              )

              canvas.toBlob(file => {
                file.name = fileName
                resolve(URL.createObjectURL(file))
              }, 'image/jpeg')
        }      
    })
  }