export const isVideoMedia = (mime = '') => mime.split('/')[0] === 'video'

const getVideoSize = src =>
	new Promise(resolve => {
		const video = document.createElement('video')
		video.src = src

		video.onloadedmetadata = ({ target }) => {
			return resolve({
				width: target.videoWidth,
				height: target.videoHeight,
			})
		}
	})

const getImageSize = src =>
	new Promise(resolve => {
		const image = new Image()
		image.src = src
		image.onload = function() {
			return resolve({
				width: this.width,
				height: this.height,
			})
		}
	})

export const getMediaSize = ({ mime, src }) =>
	isVideoMedia(mime) ? getVideoSize(src) : getImageSize(src)
