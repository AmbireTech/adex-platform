import React from 'react'
import { t } from 'selectors'
import DoneAllIcon from '@material-ui/icons/DoneAll'
import WarningIcon from '@material-ui/icons/Warning'
import HourglassFullIcon from '@material-ui/icons/HourglassFull'
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn'

const headCells = {
	Campaign: [
		{
			id: 'title',
			numeric: false,
			disablePadding: true,
			disableOrdering: true,
			label: t('PROP_MEDIA'),
		},
		{
			id: 'status.humanFriendlyName',
			numeric: false,
			disablePadding: false,
			label: t('PROP_STATUS'),
		},
		{
			id: 'depositAmount',
			numeric: true,
			disablePadding: false,
			label: t('PROP_DEPOSIT'),
		},
		{
			id: 'status.fundsDistributedRatio',
			numeric: true,
			disablePadding: false,
			label: t('PROP_DISTRIBUTED', { args: ['%'] }),
		},
		{
			id: 'minPerImpression',
			numeric: true,
			disablePadding: false,
			label: t('PROP_CPM'),
		},
		{
			id: 'created',
			numeric: true,
			disablePadding: false,
			label: t('PROP_CREATED'),
		},
		{
			id: 'activeFrom',
			numeric: true,
			disablePadding: false,
			label: t('PROP_STARTS'),
		},
		{
			id: 'withdrawPeriodStart',
			numeric: true,
			disablePadding: false,
			label: t('PROP_ENDS'),
		},
	],
	Other: [
		{
			id: 'id',
			numeric: false,
			disablePadding: true,
			disableOrdering: true,
			label: t('PROP_MEDIA'),
		},
		{
			id: 'title',
			numeric: false,
			disablePadding: false,
			label: t('PROP_TITLE'),
		},
		{
			id: 'type',
			numeric: false,
			disablePadding: false,
			label: t('PROP_TYPE'),
		},
		{
			id: 'created',
			numeric: false,
			disablePadding: false,
			label: t('PROP_CREATED'),
		},
	],
}

const filterTags = {
	Campaign: [{ name: 'active' }, { name: 'completed' }, { name: 'closed' }],
	Other: [
		{ name: 'legacy_300x250' },
		{ name: 'legacy_250x250' },
		{ name: 'legacy_240x400' },
		{ name: 'legacy_336x280' },
		{ name: 'legacy_180x150' },
		{ name: 'legacy_300x100' },
		{ name: 'legacy_720x300' },
		{ name: 'legacy_468x60' },
		{ name: 'legacy_728x90' },
		{ name: 'legacy_160x600' },
		{ name: 'legacy_120x600' },
		{ name: 'legacy_300x600' },
	],
}

const missingData = {
	Campaign: t('NO_CAMPAINGS_INFORMATION'),
	AdUnit: t('NO_ADUNITS_INFORMATION'),
	AdSlot: t('NO_ADSLOTS_INFORMATION'),
}

const mapStatusIcons = (humanFriendlyStatus, status, size) => {
	const icon = {
		xs: { fontSize: 10 },
		md: { fontSize: 15 },
		ls: { fontSize: 20 },
	}
	const waitIcon = <HourglassFullIcon style={icon[size]} color={'secondary'} />
	const doneIcon = <DoneAllIcon style={icon[size]} color={'primary'} />
	const warningIcon = <WarningIcon style={icon[size]} color={'error'} />
	const cashIcon = <MonetizationOnIcon style={icon[size]} color={'accentTwo'} />
	if (humanFriendlyStatus === 'Closed' && status.toLowerCase() !== 'exhausted')
		return waitIcon
	switch (status.toLowerCase()) {
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

export { headCells, filterTags, missingData, mapStatusIcons }
