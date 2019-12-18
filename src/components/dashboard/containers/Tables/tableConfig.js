import { t } from 'selectors'

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
			id: 'status.name',
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
	Campaign: [
		{
			name: 'active',
			alias: ['ready, active'],
			loading: ['pending', 'initializing', 'waiting'],
			warning: ['offline, disconnected, unhealthy, invalid'],
		},
		{ name: 'completed', alias: ['expired, exhausted, withdraw'] },
		{ name: 'closed' },
	],
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

const mapStatusNames = status => {
	switch (status.toLowerCase()) {
		case 'active':
		case 'ready':
		case 'pending':
		case 'initializing':
		case 'waiting':
		case 'offline':
		case 'disconnected':
		case 'unhealthy':
		case 'invalid':
			return 'Active'
		case 'expired':
		case 'exhausted':
		case 'withdraw':
			return 'Complete'
		case 'closed':
			return 'Closed'
		default:
			break
	}
}

export { headCells, filterTags, missingData, mapStatusNames }
