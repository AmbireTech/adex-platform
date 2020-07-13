import { useState, useEffect } from 'react'

export function useWindowSize() {
	const hasWindow = typeof window === 'object'

	function getWindowSize() {
		return {
			width: hasWindow ? window.innerWidth : 0,
			height: hasWindow ? window.innerHeight : 0,
		}
	}

	const [windowSize, setWindowSize] = useState(getWindowSize)

	useEffect(() => {
		if (!hasWindow) {
			return false
		}

		function onResize() {
			setWindowSize(getWindowSize())
		}

		window.addEventListener('resize', onResize)

		return () => window.removeEventListener('resize', onResize)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasWindow])

	return windowSize
}
