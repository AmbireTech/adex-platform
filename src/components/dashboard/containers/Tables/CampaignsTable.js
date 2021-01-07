import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { Tooltip, IconButton } from '@material-ui/core'
import { Visibility, Receipt } from '@material-ui/icons'
import Img from 'components/common/img/Img'
import MUIDataTableEnhanced from 'components/dashboard/containers/Tables/MUIDataTableEnhanced'
import { mapStatusIcons } from 'components/dashboard/containers/Tables/tableHelpers'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import {
	t,
	selectCampaignsTableData,
	selectMainToken,
	selectSide,
	selectCampaignsMaxImpressions,
	selectCampaignsMaxClicks,
	selectCampaignsMaxDeposit,
	selectInitialDataLoadedByData,
	selectCampaignDisplayStatus,
} from 'selectors'
import { utils } from 'ethers'
import { execute, handlePrintSelectedReceiptsAdvertiser } from 'actions'
import { useSelector } from 'react-redux'
import { formatDateTime, truncateString, formatDate } from 'helpers/formatters'
import { sliderFilterOptions } from './commonFilters'
import { useTableData } from './tableHooks'
import { ReloadData, PrintAllReceipts } from './toolbars'

const RRIconButton = withReactRouterLink(IconButton)
const RRImg = withReactRouterLink(Img)

const getCols = ({ symbol, maxImpressions, maxDeposit, maxClicks }) => [
	{
		name: 'id',
		options: {
			display: 'excluded',
			filter: false,
		},
	},
	{
		name: 'receiptAvailable',
		options: {
			display: 'excluded',
			download: false,
			filter: false,
		},
	},
	{
		name: 'media',
		label: t('PROP_MEDIA'),
		options: {
			filter: false,
			sort: false,
			download: false,
			customBodyRender: ({ side, id, mediaUrl, mediaMime, to }) => {
				return (
					<RRImg
						key={id}
						isCellImg
						src={mediaUrl}
						alt={id}
						mediaMime={mediaMime}
						allowVideo
						to={to}
					/>
				)
			},
		},
	},
	{
		name: 'status',
		label: t('PROP_STATUS'),
		options: {
			filter: true,
			sort: false,
			filterOptions: {
				names: ['ACTIVE', 'SCHEDULED', 'CLOSED', 'COMPLETED', 'PAUSED'],
				logic: ({ status }, filters) => {
					if (filters.length)
						return !filters.includes(selectCampaignDisplayStatus(status))
					return false
				},
			},
			customBodyRender: ({ status, id }) => (
				<Fragment key={id}>
					{t(selectCampaignDisplayStatus(status))}{' '}
					{mapStatusIcons(status, 'xs')}
				</Fragment>
			),
			// TODO: Sorting issue
		},
	},
	{
		name: 'title',
		label: t('PROP_TITLE'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: (title = '') => truncateString(title, 20),
		},
	},
	{
		name: 'depositAmount',
		label: t('PROP_DEPOSIT'),
		options: {
			sort: true,
			customBodyRender: depositAmount => (
				<Fragment>{`${depositAmount.toFixed(2)} ${symbol}`}</Fragment>
			),
			...sliderFilterOptions({
				initial: [0, maxDeposit],
				filterTitle: t('DEPOSIT_FILTER'),
			}),
		},
	},
	{
		name: 'fundsDistributedRatio',
		label: t('PROP_SERVED'),
		options: {
			sort: true,
			customBodyRender: fundsDistributedRatio =>
				`${((fundsDistributedRatio || 0) / 10).toFixed(2)} %`,
			...sliderFilterOptions({
				initial: [0, 100],
				filterTitle: t('DISTRIBUTED_FILTER'),
			}),
		},
	},
	{
		name: 'impressions',
		label: t('LABEL_IMPRESSIONS'),
		options: {
			sort: true,
			customBodyRender: impressions => utils.commify(impressions || 0),
			...sliderFilterOptions({
				initial: [0, maxImpressions],
				filterTitle: t('IMPRESSIONS_FILTER'),
			}),
		},
	},
	{
		name: 'clicks',
		label: t('CHART_LABEL_CLICKS'),
		options: {
			sort: true,
			customBodyRender: clicks => utils.commify(clicks || 0),
			...sliderFilterOptions({
				initial: [0, maxClicks],
				filterTitle: t('CLICKS_FILTER'),
			}),
		},
	},
	{
		name: 'ctr',
		label: t('LABEL_CTR'),
		options: {
			sort: true,
			customBodyRender: ctr => `${(ctr || 0).toFixed(2)} %`,
			...sliderFilterOptions({
				initial: [0, 100],
				filterTitle: t('CTR_FILTER'),
			}),
		},
	},
	{
		name: 'minPerImpression',
		label: t('CPM_MIN'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: minPerImpression =>
				`${minPerImpression.toFixed(2)} ${symbol}`,
		},
	},
	// {
	// 	name: 'maxPerImpression',
	// 	label: t('CPM_MAX'),
	// 	options: {
	// 		filter: false,
	// 		sort: true,
	// 		customBodyRender: maxPerImpression =>
	// 			`${maxPerImpression.toFixed(2)} ${symbol}`,
	// 	},
	// },
	{
		name: 'created',
		label: t('PROP_CREATED'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: created => formatDate(created),
		},
	},
	{
		name: 'activeFrom',
		label: t('PROP_STARTS'),
		options: {
			filter: false,
			display: false,
			sort: true,
			customBodyRender: activeFrom => formatDateTime(activeFrom),
		},
	},
	{
		name: 'withdrawPeriodStart',
		label: t('PROP_ENDS'),
		options: {
			filter: false,
			display: false,
			sort: true,
			customBodyRender: withdrawPeriodStart =>
				formatDateTime(withdrawPeriodStart),
		},
	},
	{
		name: 'actions',
		label: t('ACTIONS'),
		options: {
			filter: false,
			sort: true,
			download: false,
			customBodyRender: ({ side, id, receiptReady, to, toReceipt }) => (
				<Fragment key={id}>
					<Tooltip
						arrow
						title={t('LABEL_VIEW')}
						// placement='top'
						enterDelay={1000}
					>
						<RRIconButton to={to} variant='contained' aria-label='preview'>
							<Visibility color='primary' />
						</RRIconButton>
					</Tooltip>
					<Tooltip
						arrow
						title={
							receiptReady
								? t('RECEIPT_VIEW')
								: 'Report not available until the campaign is completed'
						}
						// placement='top'
						enterDelay={1000}
					>
						{/* SPAN needed to enable tooltip on hover of disabled element
						 https://material-ui.com/components/tooltips/#disabled-elements
						*/}
						<span>
							<RRIconButton
								to={toReceipt}
								variant='contained'
								aria-label='receip'
								disabled={!receiptReady}
							>
								<Receipt color={receiptReady ? 'primary' : 'disabled'} />
							</RRIconButton>
						</span>
					</Tooltip>
				</Fragment>
			),
		},
	},
]

const onDownload = (buildHead, buildBody, columns, data, decimals, symbol) => {
	const mappedData = data.map(i => ({
		index: i.index,
		data: [
			i.data[0],
			i.data[1],
			i.data[2],
			i.data[3].humanFriendlyName,
			`${i.data[4]} ${symbol}`,
			`${((i.data[5] || 0) / 10).toFixed(2)} %`,
			i.data[6],
			i.data[7],
			i.data[8],
			formatDateTime(i.data[9]),
			formatDateTime(i.data[10]),
			formatDateTime(i.data[11]),
		],
	}))
	return `${buildHead(columns)}${buildBody(mappedData)}`.trim()
}

const getOptions = ({ decimals, symbol }) => ({
	filterType: 'multiselect',
	selectableRows: 'none',
	sortOrder: {
		name: 'created',
		direction: 'desc',
	},
	onDownload: (buildHead, buildBody, columns, data) =>
		onDownload(buildHead, buildBody, columns, data, decimals, symbol),
	customToolbarSelect: (selectedRows, displayData, setSelectedRows) => {
		const selectedIndexes = selectedRows.data.map(i => i.dataIndex)
		const selectedItems = displayData
			.filter(item => selectedIndexes.includes(item.dataIndex) && item.data[1])
			.map(item => item.data[0])
		return (
			<PrintAllReceipts
				handlePrintAllReceipts={() =>
					execute(handlePrintSelectedReceiptsAdvertiser(selectedItems))
				}
				disabled={selectedItems.length === 0}
			/>
		)
	},
})

function CampaignsTable(props) {
	const side = useSelector(selectSide)
	const maxImpressions = useSelector(selectCampaignsMaxImpressions)
	const maxClicks = useSelector(selectCampaignsMaxClicks)
	const maxDeposit = useSelector(selectCampaignsMaxDeposit)
	const { symbol, decimals } = useSelector(selectMainToken)
	const campaignsLoaded = useSelector(state =>
		selectInitialDataLoadedByData(state, 'campaigns')
	)
	const [options, setOptions] = useState({})

	const getColumns = useCallback(() => {
		return () =>
			getCols({
				decimals,
				symbol,
				maxImpressions,
				maxClicks,
				maxDeposit,
			})
	}, [decimals, maxClicks, maxDeposit, maxImpressions, symbol])

	const { data, columns } = useTableData({
		selector: selectCampaignsTableData,
		selectorArgs: side,
		getColumns,
	})

	useEffect(() => {
		setOptions(getOptions({ decimals, symbol }))
	}, [decimals, symbol])

	return (
		<MUIDataTableEnhanced
			title={t('ALL_CAMPAIGNS')}
			data={data}
			columns={columns}
			options={options}
			rowSelectable
			toolbarEnabled
			loading={!campaignsLoaded}
			{...props}
		/>
	)
}

export default CampaignsTable
