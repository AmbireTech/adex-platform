import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectLocation } from 'selectors'
import packageJson from '../../../package.json'
import { refreshCacheAndReload, execute } from 'actions'
global.appVersion = packageJson.version

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
		fetch('/meta.json')
			.then(response => response.json())
			.then(meta => {
				const latestVersion = meta.version
				const currentVersion = global.appVersion
				const shouldForceRefresh = semverGreaterThan(
					latestVersion,
					currentVersion
				)
				if (shouldForceRefresh) {
					execute(
						refreshCacheAndReload({
							version: latestVersion,
						})
					)
				}
			})
	}, [location])

	return props.children
}
