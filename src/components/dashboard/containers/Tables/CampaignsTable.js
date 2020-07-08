import React, { Fragment } from 'react'
import classnames from 'classnames'
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
} from 'selectors'
import { makeStyles } from '@material-ui/core/styles'
import { commify } from 'ethers/utils'
import { execute, handlePrintSelectedReceiptsAdvertiser } from 'actions'
import { useSelector } from 'react-redux'
import { styles } from './styles'
import { formatDateTime, truncateString, formatDate } from 'helpers/formatters'
import { sliderFilterOptions } from './commonFilters'
import { useTableData } from './tableHooks'
import { ReloadData, PrintAllReceipts } from './toolbars'

const RRIconButton = withReactRouterLink(IconButton)
const RRImg = withReactRouterLink(Img)

const useStyles = makeStyles(styles)

const getCols = ({
	classes,
	symbol,
	maxImpressions,
	maxDeposit,
	maxClicks,
}) => [
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
						className={classnames(classes.cellImg)}
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
				names: ['Active', 'Closed', 'Completed'],
				logic: (status, filters) => {
					if (filters.length) return !filters.includes(status.humanFriendlyName)
					return false
				},
			},
			customBodyRender: ({ humanFriendlyName, originalName, id }) => (
				<Fragment key={id}>
					{t(humanFriendlyName, { toUpperCase: true })}{' '}
					{mapStatusIcons(humanFriendlyName, originalName, 'xs')}
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
			customBodyRender: impressions => commify(impressions || 0),
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
			customBodyRender: clicks => commify(clicks || 0),
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
		label: t('PROP_CPM'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: ({ minPerImpression, id }) => (
				<Fragment key={id}>{`${minPerImpression.toFixed(
					2
				)} ${symbol}`}</Fragment>
			),
		},
	},
	{
		name: 'created',
		label: t('PROP_CREATED'),
		options: {
			filter: false,
			sort: true,
			sortDirection: 'desc',
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
						title={t('LABEL_VIEW')}
						// placement='top'
						enterDelay={1000}
					>
						<RRIconButton to={to} variant='contained' aria-label='preview'>
							<Visibility color='primary' />
						</RRIconButton>
					</Tooltip>
					<Tooltip
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

const getOptions = ({ decimals, symbol, reloadData }) => ({
	filterType: 'multiselect',
	selectableRows: 'none',
	onDownload: (buildHead, buildBody, columns, data) =>
		onDownload(buildHead, buildBody, columns, data, decimals, symbol),
	customToolbar: () => <ReloadData handleReload={reloadData} />,
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
	const classes = useStyles()
	const side = useSelector(selectSide)
	const maxImpressions = useSelector(selectCampaignsMaxImpressions)
	const maxClicks = useSelector(selectCampaignsMaxClicks)
	const maxDeposit = useSelector(selectCampaignsMaxDeposit)
	const { symbol, decimals } = useSelector(selectMainToken)
	const campaignsLoaded = useSelector(state =>
		selectInitialDataLoadedByData(state, 'campaigns')
	)

	const { data, columns, reloadData } = useTableData({
		selector: selectCampaignsTableData,
		selectorArgs: side,
		getColumns: () =>
			getCols({
				decimals,
				classes,
				symbol,
				maxImpressions,
				maxClicks,
				maxDeposit,
			}),
	})

	const options = getOptions({ decimals, symbol, reloadData })

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
