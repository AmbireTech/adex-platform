/**
 * @param {HTMLImageElement} image - Image File Object
 * @param {Object} crop - crop Object from react-image-crop
 * @param {String} fileName - Name of the returned file in Promise
 * @param {Object} size - { width, height } - for image scale
 */
export const getCroppedImgUrl = (image, crop, fileName, size) => {
	const canvas = document.createElement('canvas')
	const scaleX = image.naturalWidth / image.width
	const scaleY = image.naturalHeight / image.height
	canvas.width = crop.width
	canvas.height = crop.height
	const ctx = canvas.getContext('2d')

	ctx.drawImage(
		image,
		crop.x * scaleX,
		crop.y * scaleY,
		crop.width * scaleX,
		crop.height * scaleY,
		0,
		0,
		crop.width,
		crop.height
	)

	const scaleCanvas = document.createElement('canvas')

	scaleCanvas.width = size.width
	scaleCanvas.height = size.height

	const sctx = scaleCanvas.getContext('2d')

	sctx.drawImage(
		canvas,
		0,
		0,
		crop.width,
		crop.height,
		0,
		0,
		size.width,
		size.height
	)

	return new Promise((resolve, reject) => {
		scaleCanvas.toBlob(
			file => {
				if (!file) {
					reject('Error cropping file')
				}
				file.name = fileName
				resolve(URL.createObjectURL(file))
			},
			'image/jpeg',
			1
		)
	})
}
