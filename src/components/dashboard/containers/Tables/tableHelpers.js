import React from 'react'
import DoneAllIcon from '@material-ui/icons/DoneAll'
import WarningIcon from '@material-ui/icons/Warning'
import HourglassFullIcon from '@material-ui/icons/HourglassFull'
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn'

const mapStatusIcons = (status = {}, size) => {
	const icon = {
		xs: { fontSize: 10 },
		md: { fontSize: 15 },
		ls: { fontSize: 20 },
	}
	const waitIcon = <HourglassFullIcon style={icon[size]} color={'secondary'} />
	const doneIcon = <DoneAllIcon style={icon[size]} color={'primary'} />
	const warningIcon = <WarningIcon style={icon[size]} color={'error'} />
	const cashIcon = <MonetizationOnIcon style={icon[size]} color={'secondary'} />
	const { name = '', humanFriendlyName = '' } = status
	if (humanFriendlyName === 'Closed' && name.toLowerCase() !== 'exhausted')
		return waitIcon
	switch (name.toLowerCase()) {
		case 'active':
		case 'ready':
			return doneIcon
		case 'pending':
		case 'initializing':
		case 'waiting':
			return waitIcon
		case 'offline':
		case 'disconnected':
		case 'unhealthy':
		case 'invalid':
			return warningIcon
		case 'withdraw':
			return cashIcon
		default:
			return ''
	}
}

export { mapStatusIcons }
