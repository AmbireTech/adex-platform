/**
 * @param {String} objUrl - Image blob url URL.createObjectURL
 * @param {Object} pixelCrop - pixelCrop Object provided by react-image-crop
 * @param {String} fileName - Name of the returned file in Promise
 */
export const getCroppedImgUrl = ({objUrl, pixelCrop, fileName, size}) => {
    const cropCanvas = document.createElement('canvas')
    const scaleCanvas = document.createElement('canvas')

    let img = new Image()
    img.src = objUrl
  
    // As a blob
    return new Promise((resolve, reject) => {
        img.onload = () => {
            const width = img.width
            const height = img.height

            // pixelCrop come in %
            const crop = {
                x: width * (pixelCrop.x / 100),
                y: height * (pixelCrop.y / 100),
                width: width * (pixelCrop.width / 100),
                height: height * (pixelCrop.height / 100),
            }
              
            cropCanvas.width = crop.width
            cropCanvas.height = crop.height
            const cctx = cropCanvas.getContext('2d')

            cctx.drawImage(
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

            scaleCanvas.width = size.width
            scaleCanvas.height = size.height

            const sctx = scaleCanvas.getContext('2d')

            sctx.drawImage(
                cropCanvas,
                0,
                0,
                crop.width,
                crop.height,
                0,
                0,
                size.width,
                size.height
            )

            scaleCanvas.toBlob(file => {
                file.name = fileName
                resolve(URL.createObjectURL(file))
            }, 'image/jpeg')
        }      
    })
}