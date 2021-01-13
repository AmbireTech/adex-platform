import React, { useState, useCallback, useEffect } from 'react'
import { Box, IconButton, Tooltip } from '@material-ui/core'
import { utils } from 'ethers'
import { Visibility } from '@material-ui/icons'
import Img from 'components/common/img/Img'
import MUIDataTableEnhanced from 'components/dashboard/containers/Tables/MUIDataTableEnhanced'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import { ArchiveItemBtn } from 'components/dashboard/containers/ItemCommon'
import {
	t,
	selectSide,
	selectAdSlotsTableData,
	selectMainToken,
	selectInitialDataLoadedByData,
} from 'selectors'
import { useSelector } from 'react-redux'
import { formatDateTime, truncateString } from 'helpers/formatters'
import { useTableData } from './tableHooks'
import { ReloadData } from './toolbars'

const RRIconButton = withReactRouterLink(IconButton)
const RRImg = withReactRouterLink(Img)

const getCols = ({ symbol }) => [
	{
		name: 'media',
		label: t('PROP_MEDIA'),
		options: {
			filter: false,
			sort: false,
			download: false,
			customBodyRender: ({ id, mediaUrl, mediaMime, to }) => {
				return (
					<RRImg
						key={id}
						fullScreenOnClick={true}
						src={mediaUrl}
						alt={id}
						mediaMime={mediaMime}
						allowVideo
						to={to}
						isCellImg
					/>
				)
			},
		},
	},
	{
		name: 'title',
		label: t('PROP_TITLE'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: title => truncateString(title, 20),
		},
	},
	{
		name: 'type',
		label: t('PROP_TYPE'),
		options: {
			filter: true,
			sort: true,
		},
	},
	{
		name: 'created',
		label: t('PROP_CREATED'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: created => formatDateTime(created),
		},
	},
	{
		name: 'impressions',
		label: t('LABEL_IMPRESSIONS'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: impressions => utils.commify(impressions || 0),
		},
	},
	{
		name: 'clicks',
		label: t('LABEL_CLICKS'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: clicks => utils.commify(clicks || 0),
		},
	},
	{
		name: 'ctr',
		label: t('LABEL_CTR'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: ctr => `${ctr.toFixed(4)} %`,
		},
	},
	{
		name: 'earnings',
		label: t('LABEL_EARNINGS'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: earnings => `${earnings.toFixed(2)} ${symbol}`,
		},
	},
	{
		name: 'actions',
		label: t('ACTIONS'),
		options: {
			filter: false,
			sort: true,
			download: false,
			customBodyRender: ({ to, item, id, title }) => (
				<Box key={id}>
					<Tooltip
						arrow
						key={item.id}
						title={t('LABEL_VIEW')}
						// placement='top'
						enterDelay={1000}
						aria-label='view'
					>
						<RRIconButton to={to} variant='contained'>
							<Visibility color='primary' />
						</RRIconButton>
					</Tooltip>
					<ArchiveItemBtn
						itemType='AdSlot'
						itemId={id}
						title={title}
						isIconBtn
					/>
				</Box>
			),
		},
	},
]

const onDownload = (buildHead, buildBody, columns, data) => {
	const mappedData = data.map(i => ({
		index: i.index,
		data: [
			i.data[0].id,
			i.data[1],
			i.data[2].replace('legacy_', ''),
			formatDateTime(i.data[3]),
		],
	}))
	return `${buildHead(columns)}${buildBody(mappedData)}`.trim()
}

const getOptions = () => ({
	filterType: 'multiselect',
	sortOrder: {
		name: 'created',
		direction: 'desc',
	},
	selectableRows: 'none',
	onDownload: (buildHead, buildBody, columns, data) =>
		onDownload(buildHead, buildBody, columns, data),
})

function AdSlotsTable(props) {
	const { symbol } = useSelector(selectMainToken)
	const itemsLoaded = useSelector(state =>
		selectInitialDataLoadedByData(state, 'allItems')
	)

	const [options, setOptions] = useState({})

	const getColumns = useCallback(
		() =>
			getCols({
				symbol,
			}),
		[symbol]
	)

	const { data, columns } = useTableData({
		selector: selectAdSlotsTableData,
		getColumns,
	})

	useEffect(() => {
		setOptions(getOptions())
	}, [])

	return (
		<MUIDataTableEnhanced
			title={t('ALL_SLOTS')}
			data={data}
			columns={columns}
			options={options}
			loading={!itemsLoaded}
			{...props}
		/>
	)
}

export default AdSlotsTable
