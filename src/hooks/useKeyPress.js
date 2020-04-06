import { useState, useEffect } from 'react'

export function useKeyPress(targetKey) {
	const [keyPressed, setKeyPressed] = useState(false)

	// eslint-disable-next-line react-hooks/exhaustive-deps
	function downHandler({ key }) {
		if (key === targetKey) {
			setKeyPressed(true)
		}
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const upHandler = ({ key }) => {
		if (key === targetKey) {
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
