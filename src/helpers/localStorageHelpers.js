export function loadFromLocalStorage(key) {
	try {
		const data = localStorage.getItem(key)
		if (data === null) {
			return undefined
		}
		return JSON.parse(data)
	} catch (err) {
		return undefined
	}
}

export function saveToLocalStorage(data, key) {
	try {
		const serialized = JSON.stringify(data)
		localStorage.setItem(key, serialized)
	} catch (err) {
		console.warn(err)
	}
}

export function removeFromLocalStorage(key) {
	localStorage.removeItem(key)
}

export function getKeys() {
	return Object.keys(localStorage)
}
