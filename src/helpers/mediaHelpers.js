export const isVideoMedia = (mime = '') => mime.split('/')[0] === 'video'

const getVideoSize = src =>
	new Promise(resolve => {
		const video = document.createElement('video')
		video.src = src.tempUrl

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
		image.src = src.tempUrl
		image.onload = function() {
			resolve({
				width: this.width,
				height: this.height,
			})
		}
	})

export const getSize = media =>
	isVideoMedia(media.mime) ? getVideoSize(media) : getImageSize(media)
