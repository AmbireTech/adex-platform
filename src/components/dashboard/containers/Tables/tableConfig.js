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
			numeric: true,
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
		// {
		// 	id: 'actions',
		// 	numeric: true,
		// 	disablePadding: false,
		// 	disableOrdering: true,
		// 	label: t('ACTIONS'),
		// },
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
		// {
		// 	id: 'actions',
		// 	numeric: true,
		// 	disablePadding: false,
		// 	disableOrdering: true,
		// 	label: t('ACTIONS'),
		// },
	],
}

const filterTags = {
	Campaign: [
		{ name: 'exhausted' },
		{ name: 'initializing' },
		{ name: 'expired' },
		{ name: 'active' },
		{ name: 'pending' },
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

export { headCells, filterTags }
