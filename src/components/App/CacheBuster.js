import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectLocation } from 'selectors'
import packageJson from '../../../package.json'
import { updateNewVersion, execute, notifyNewTOS } from 'actions'

const buildMeta = {
	currentVersion: packageJson.version,
	currentTOS: packageJson.tosVersion,
}

export default function CacheBuster(props) {
	const location = useSelector(selectLocation) || {}

	useEffect(() => {
		let r = Math.random()
			.toString(36)
			.substring(2)
		fetch(`/meta.json?r=${r}`, { cache: 'no-cache' })
			.then(response => response.json())
			.then(meta => {
				const { latestVersion, latestTOS } = meta
				const { currentVersion, currentTOS } = buildMeta
				const shouldForceRefresh = latestVersion !== currentVersion

				execute(
					updateNewVersion({
						shouldForceRefresh,
						version: latestVersion,
					})
				)

				const shouldNotifyNewTOS = latestTOS !== currentTOS
				if (shouldNotifyNewTOS) {
					execute(notifyNewTOS())
				}
			})
	}, [location])

	return props.children
}
