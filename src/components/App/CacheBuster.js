import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectLocation } from 'selectors'
import packageJson from '../../../package.json'
global.appVersion = packageJson.version

export default function CacheBuster(props) {
	const [loading, setLoading] = useState(true)
	const [isLatestVersion, setIsLatestVersion] = useState(true)
	const location = useSelector(selectLocation) || {}
	const refreshCacheAndReload = () => {
		console.log('Clearing cache and hard reloading...')
		if (caches) {
			// Service worker cache should be cleared with caches.delete()
			caches.keys().then(async function(names) {
				await Promise.all(names.map(name => caches.delete(name)))
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
					setLoading(false)
					setIsLatestVersion(false)
				} else {
					console.log(
						`You already have the latest version - ${latestVersion}. No cache refresh needed.`
					)
					setIsLatestVersion(true)
					setLoading(false)
				}
			})
	}, [location])

	if (loading) return null
	if (!loading && !isLatestVersion) {
		// You can decide how and when you want to force reload
		refreshCacheAndReload()
	}
	return props.children
}
