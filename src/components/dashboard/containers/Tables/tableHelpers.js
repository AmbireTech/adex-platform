import React from 'react'
import { Tooltip } from '@material-ui/core'
import {
	DoneAllSharp as DoneAllIcon,
	WarningSharp as WarningIcon,
	HourglassFullSharp as HourglassFullIcon,
	MonetizationOnSharp as MonetizationOnIcon,
	PauseSharp as PauseIcon,
} from '@material-ui/icons'
import { t } from 'selectors'

const IconTooltip = ({ children, name }) => (
	<Tooltip title={t(name, { toUpperCase: true })} aria-label={name}>
		{children}
	</Tooltip>
)

const mapStatusIcons = (status = {}, size) => {
	const icon = {
		xs: { fontSize: 10 },
		md: { fontSize: 15 },
		ls: { fontSize: 20 },
	}

	const { name = '', humanFriendlyName = '' } = status

	const Wait = (
		<IconTooltip name={name}>
			<HourglassFullIcon style={icon[size]} color={'secondary'} />
		</IconTooltip>
	)
	const Done = (
		<IconTooltip name={name}>
			<DoneAllIcon style={icon[size]} color={'primary'} />
		</IconTooltip>
	)
	const Warning = (
		<IconTooltip name={name}>
			<WarningIcon style={icon[size]} color={'error'} />
		</IconTooltip>
	)
	const Cash = (
		<IconTooltip name={name}>
			<MonetizationOnIcon style={icon[size]} color={'secondary'} />
		</IconTooltip>
	)

	const Pause = (
		<IconTooltip name={name}>
			<PauseIcon style={icon[size]} color={'secondary'} />
		</IconTooltip>
	)

	if (humanFriendlyName === 'Closed' && name.toLowerCase() !== 'exhausted')
		return Wait
	if (humanFriendlyName === 'Paused') return Pause

	switch (name.toLowerCase()) {
		case 'active':
		case 'ready':
			return Done
		case 'pending':
		case 'initializing':
		case 'waiting':
			return Wait
		case 'offline':
		case 'disconnected':
		case 'unhealthy':
		case 'invalid':
			return Warning
		case 'withdraw':
			return Cash
		default:
			return ''
	}
}

export { mapStatusIcons }
