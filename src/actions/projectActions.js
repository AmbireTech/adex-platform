import { PROJECTS } from 'constants/global'
import { UPDATE_PROJECT } from 'constants/actionTypes'

export function updateProject(hostname) {
	return function(dispatch) {
		const subdomain = hostname.split('.')[0]

		switch (subdomain) {
			case 'wallet':
				return dispatch({
					type: UPDATE_PROJECT,
					value: PROJECTS.wallet,
				})
			case 'platform':
			default:
				return dispatch({
					type: UPDATE_PROJECT,
					value: PROJECTS.platform,
				})
		}
	}
}
