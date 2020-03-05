const fs = require('fs')
const packageJson = require('../package.json')

const jsonData = {
	latestVersion: packageJson.version,
	latestTOS: packageJson.tosVersion,
}

var jsonContent = JSON.stringify(jsonData)

fs.writeFile('./public/meta.json', jsonContent, 'utf8', function(err) {
	if (err) {
		console.log('An error occured while writing JSON Object to meta.json')
		return console.log(err)
	}

	console.log('meta.json file has been saved with latest version number')
})
