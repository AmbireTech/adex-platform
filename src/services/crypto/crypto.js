// Nodejs encryption with CTR
var crypto = require('crypto'),
	algorithm = 'aes-256-ctr',
	default_password = 'kaipahH5' // temp

export const encrypt = (text, password = default_password) => {
	if (!text) return ''
	var cipher = crypto.createCipher(algorithm, password)
	var crypted = cipher.update(text, 'utf8', 'hex')
	crypted += cipher.final('hex')
	return crypted
}

export const decrypt = (text, password = default_password) => {
	if (!text) return ''
	var decipher = crypto.createDecipher(algorithm, password)
	var dec = decipher.update(text, 'hex', 'utf8')
	dec += decipher.final('utf8')
	return dec
}
