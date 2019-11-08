import vision from '@google-cloud/vision'

export const quickstart = async image => {
	try {
		// Creates a client
		const client = new vision.ImageAnnotatorClient()
		// Performs label detection on the image file
		const [result] = await client.labelDetection()
		console.log(result)
	} catch (error) {
		console.log(error)
	}
}
