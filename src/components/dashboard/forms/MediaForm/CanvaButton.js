import React, { useState, useEffect } from 'react'
import './CanvaButton.css'

function CanvaButton({ saveFileObjectToState, size }) {
	const [canvaApi, setCanvaApi] = useState(null)

	useEffect(() => {
		var script
		function initCanva(document, url) {
			script = document.createElement('script')
			script.src = url
			script.onload = function() {
				if (window.Canva && window.Canva.DesignButton) {
					window.Canva.DesignButton.initialize({
						apiKey: process.env.CANVA_API, //test api key only for localhost and test
					}).then(api => {
						setCanvaApi(api)
						window.canvaApi = api
					})
				}
			}
			document.body.appendChild(script)
		}
		if (!window.canvaApi) {
			//perhaps download it and load it locally
			initCanva(document, 'https://sdk.canva.com/designbutton/v2/api.js')
		} else {
			setCanvaApi(window.canvaApi)
		}
	}, [])

	const handleCreateCanvaAd = () => {
		if (canvaApi) {
			canvaApi.createDesign({
				design: {
					type: 'WideSkyscraperAd',
					dimensions: {
						width: size.width,
						height: size.height,
					},
				},
				onDesignOpen: ({ designId }) => {
					// Triggered when editor finishes loading and opens a new design.
					// You can save designId for future use.
				},
				onDesignPublish: async ({ exportUrl, designId }) => {
					// Triggered when design is published to an image.
					// Save the image to your server as the exportUrl will expire shortly.
					const res = await fetch(exportUrl)
					const blob = await res.blob()
					const file = new File([blob], `${designId}.png`, {
						type: 'image/png',
					})
					saveFileObjectToState(file)
				},
				onDesignClose: () => {
					// Triggered when editor is closed.
				},
			})
		}
	}

	return (
		<span
			className='canva-btn canva-btn-theme-default canva-btn-size-m'
			onClick={() => handleCreateCanvaAd()}
		>
			<span className='canva-btn-i'></span>
			Design on Canva
		</span>
	)
}

export default CanvaButton
