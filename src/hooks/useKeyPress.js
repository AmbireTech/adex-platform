import { useState, useEffect } from 'react'

export function useKeyPress(targetKey) {
	const [keyPressed, setKeyPressed] = useState(false)

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const downHandler = ev => {
		if (ev.key === targetKey) {
			ev.preventDefault()
			setKeyPressed(true)
		}
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const upHandler = ev => {
		if (ev.key === targetKey) {
			ev.preventDefault()
			setKeyPressed(false)
		}
	}

	useEffect(() => {
		window.addEventListener('keydown', downHandler)
		window.addEventListener('keyup', upHandler)
		return () => {
			window.removeEventListener('keydown', downHandler)
			window.removeEventListener('keyup', upHandler)
		}
	}, [downHandler, upHandler])

	return keyPressed
}
