export const getImgObjectUrlFromExternalUrl = async imgUrl => {
	const res = await fetch(imgUrl)
	const blob = await res.blob()
	const objectUrl = URL.createObjectURL(blob)

	return objectUrl
}
