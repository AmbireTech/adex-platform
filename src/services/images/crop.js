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

	const sourceWidth = crop.width * scaleX
	const sourceHeight = crop.height * scaleY
	canvas.width = sourceWidth
	canvas.height = sourceHeight
	const ctx = canvas.getContext('2d')

	ctx.drawImage(
		image,
		crop.x * scaleX,
		crop.y * scaleY,
		sourceWidth,
		sourceHeight,
		0,
		0,
		sourceWidth,
		sourceHeight
	)

	let finalCanvas = canvas

	if (size && size.width && size.height) {
		// Pre blurred img
		const bl = document.createElement('canvas')
		bl.width = sourceWidth
		bl.height = sourceHeight
		const bctx = bl.getContext('2d')
		const blur = Math.floor(sourceWidth / size.width / 3)
		bctx.filter = `blur(${blur}px)`
		bctx.drawImage(canvas, 0, 0, sourceWidth, sourceHeight)

		finalCanvas = document.createElement('canvas')
		finalCanvas.width = size.width
		finalCanvas.height = size.height

		const sctx = finalCanvas.getContext('2d')

		sctx.drawImage(
			bl,
			0,
			0,
			sourceWidth,
			sourceHeight,
			0,
			0,
			size.width,
			size.height
		)
	}

	return new Promise((resolve, reject) => {
		finalCanvas.toBlob(
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
