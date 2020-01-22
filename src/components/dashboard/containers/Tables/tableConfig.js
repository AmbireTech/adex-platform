import React from 'react'
import { t } from 'selectors'
import DoneAllIcon from '@material-ui/icons/DoneAll'
import WarningIcon from '@material-ui/icons/Warning'
import HourglassFullIcon from '@material-ui/icons/HourglassFull'
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn'
import { constants } from 'adex-models'

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
			isDate: true,
			disablePadding: false,
			label: t('PROP_CREATED'),
		},
		{
			id: 'activeFrom',
			numeric: true,
			isDate: true,
			disablePadding: false,
			label: t('PROP_STARTS'),
		},
		{
			id: 'withdrawPeriodStart',
			numeric: true,
			isDate: true,
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
			isDate: true,
			disablePadding: false,
			label: t('PROP_CREATED'),
		},
	],
}

const filterTags = {
	Campaign: [{ name: 'active' }, { name: 'completed' }, { name: 'closed' }],
	Other: constants.AdUnitsTypes.map(type => {
		return {
			name: type,
			label: type.split('_')[1],
		}
	}),
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
