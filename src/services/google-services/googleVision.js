export const labelDetection = async image => {
	try {
		// Imports the Google Cloud client library
		const vision = require('@google-cloud/vision')

		// Creates a client
		const client = new vision.ImageAnnotatorClient()

		// Performs label detection on the image file
		const [result] = await client.labelDetection('./resources/wakeupcat.jpg')
		console.log(result)
	} catch (error) {
		console.log(error)
	}
}
