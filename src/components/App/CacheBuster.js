import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import packageJson from '../../../package.json'
global.appVersion = packageJson.version

export default function CacheBuster(props) {
	let location = useLocation()
	const refreshCacheAndReload = () => {
		console.log('Clearing cache and hard reloading...')
		if (caches) {
			// Service worker cache should be cleared with caches.delete()
			caches.keys().then(function(names) {
				for (let name of names) caches.delete(name)
			})
		}
		// delete browser cache and hard reload
		window.location.reload(true)
	}

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
					console.log(
						`We have a new version - ${latestVersion}. Should force refresh`
					)
					global.appVersion = meta.version
					refreshCacheAndReload()
				} else {
					console.log(
						`You already have the latest version - ${latestVersion}. No cache refresh needed.`
					)
				}
			})
	}, [location])

	return props.children
}
