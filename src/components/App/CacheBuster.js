import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectLocation } from 'selectors'
import packageJson from '../../../package.json'
import { refreshCacheAndReload, execute, notifyNewTOS } from 'actions'
global.meta = {
	currentVersion: packageJson.version,
	currentTOS: packageJson.tosVersion,
}

export default function CacheBuster(props) {
	const location = useSelector(selectLocation) || {}
	const semverGreaterThan = (versionA, versionB) => {
		const versionsA = versionA.split(/\./g)

		const versionsB = versionB.split(/\./g)
		while (versionsA.length || versionsB.length) {
			const a = Number(versionsA.shift())

			const b = Number(versionsB.shift())
			// eslint-disable-next-line no-continue
			if (a === b) continue
			// eslint-disable-next-line no-restricted-globals
			return a > b || isNaN(b)
		}
		return false
	}

	useEffect(() => {
		let r = Math.random()
			.toString(36)
			.substring(7)
		fetch(`/meta.json?r=${r}`, { cache: 'no-cache' })
			.then(response => response.json())
			.then(meta => {
				const { latestVersion, latestTOS } = meta
				const { currentVersion, currentTOS } = global.meta || {}
				const shouldForceRefresh =
					!global.meta || semverGreaterThan(latestVersion, currentVersion)
				if (shouldForceRefresh) {
					execute(
						refreshCacheAndReload({
							version: latestVersion,
						})
					)
				}
				const shouldNotifyNewTOS =
					!global.meta || semverGreaterThan(latestTOS, currentTOS)
				if (shouldNotifyNewTOS) {
					execute(notifyNewTOS())
				}
			})
	}, [location])

	return props.children
}
