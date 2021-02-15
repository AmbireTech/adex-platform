import React, { useState, useEffect } from 'react'
import './CanvaButton.css'

function CanvaButton() {
	const [loadedCanva, setLoadedCanva] = useState(false)
	const [canvaApi, setCanvaApi] = useState(null)

	useEffect(() => {
		function initCanva(document, url) {
			var script = document.createElement('script')
			script.src = url
			script.onload = function() {
				if (window.Canva && window.Canva.DesignButton) {
					window.Canva.DesignButton.initialize({
						apiKey: 'hJWa9jV3224Iq2B54I5RuB3d',
					}).then(api => setCanvaApi(api))
				}
			}
			document.body.appendChild(script)
		}
		initCanva(document, 'https://sdk.canva.com/designbutton/v2/api.js')
	}, [])

	const handleCreateCanvaAd = () => {
		if (canvaApi) {
			console.log()
		}
	}

	return (
		<span
			class='canva-btn canva-btn-theme-default canva-btn-size-m'
			onClick={() => handleCreateCanvaAd()}
		>
			<span class='canva-btn-i'></span>
			Design on Canva
		</span>
	)
}

export default CanvaButton
