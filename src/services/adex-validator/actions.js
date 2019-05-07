import Requester from 'services/requester'
import { translate } from 'services/translations/translations'


const getRequester = ({campaign}) => {
	const leader = (campaign.validators || campaign.spec.validators)[0]
	const requester = new Requester({baseUrl: leader.url})

	return requester
}

const processResponse = (res) => {
	if (res.status >= 200 && res.status < 400) {
		return res.json()
	}

	return res
		.text()
		.then(text => {
			throw new Error(
				translate('SERVICE_ERROR_MSG',
					{
						args: [
							res.url,
							res.status,
							res.statusText,
							text
						]
					}))
		})
}

export const lastApprovedState = ({ campaign }) => {
	const requester = getRequester({campaign})

	return requester.fetch({
		route: `channel/${campaign.id}/last-approved`,
		method: 'GET'
	}).then(processResponse)
}
