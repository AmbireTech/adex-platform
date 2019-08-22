export const addSig = ({
	addr = '',
	sig,
	mode,
	expiryTime,
	identity = 'notset',
}) => {
	if (!addr || !sig || !expiryTime || mode === undefined) {
		throw new Error('addSig - all args are required')
	}

	localStorage.setItem(
		'addr-' + mode + '-' + addr.toLowerCase() + '-' + identity,
		sig + '-' + expiryTime
	)
}

export const getSig = ({ addr = '', identity = '', mode }) => {
	let sigAndTIme = localStorage.getItem(
		'addr-' + mode + '-' + addr.toLowerCase() + '-' + identity
	)

	if (!sigAndTIme) {
		return null
	}

	sigAndTIme = sigAndTIme.split('-')
	let sig = sigAndTIme[0]
	let time = sigAndTIme[1]

	if (!time || parseInt(time, 10) <= Date.now()) {
		return null
	} else {
		return sig
	}
}
