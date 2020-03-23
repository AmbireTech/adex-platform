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
	selectPublisherReceiptsStatsTableData,
} from 'selectors'
import { makeStyles } from '@material-ui/core/styles'
import { commify } from 'ethers/utils'
import { execute, handlePrintSelectedReceipts, getReceiptData } from 'actions'
import { useSelector } from 'react-redux'
import { styles } from './styles'
import { formatDateTime, truncateString } from 'helpers/formatters'
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
		name: 'impressions',
		options: {
			filter: false,
			customBodyRender: impressions => commify(impressions || 0),
		},
	},
	{
		name: 'payouts',
		options: {
			filter: true,
			sort: false,
			// filterOptions: {
			// 	names: ['Active', 'Closed', 'Completed'],
			// 	logic: (status, filters) => {
			// 		if (filters.length) return !filters.includes(status.humanFriendlyName)
			// 		return false
			// 	},
			// },
			customBodyRender: payouts => commify(payouts.toFixed(2) || 0),
			// TODO: Sorting issue
		},
	},
	{
		name: 'startOfMonth',
		label: t('RECEIPT_MONTH'),
		options: {
			filter: false,
			sort: true,
			sortDirection: 'desc',
			customBodyRender: startOfMonth =>
				formatDateTime(startOfMonth, 'MMMM, YYYY'),
		},
	},
	{
		name: 'endOfMonth',
		label: t('ACTIONS'),
		options: {
			filter: false,
			sort: true,
			download: false,
			customBodyRender: endOfMonth => (
				<Fragment key={endOfMonth}>
					<Tooltip
						title={t('LABEL_VIEW')}
						// placement='top'
						enterDelay={1000}
					>
						<RRIconButton
							to={`/dashboard/publisher/receipt/${formatDateTime(
								endOfMonth,
								'YYYY-MM'
							)}`}
							variant='contained'
							aria-label='preview'
						>
							<Receipt color='primary' />
						</RRIconButton>
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
					execute(handlePrintSelectedReceipts(selectedItems))
				}
				disabled={selectedItems.length === 0}
			/>
		)
	},
})

function PublisherReceiptsTable(props) {
	const classes = useStyles()
	// const data = useSelector(selectPublisherReceiptStats)
	// console.log(data)
	const side = useSelector(selectSide)
	const maxImpressions = useSelector(selectCampaignsMaxImpressions)
	const maxClicks = useSelector(selectCampaignsMaxClicks)
	const maxDeposit = useSelector(selectCampaignsMaxDeposit)
	const { symbol, decimals } = useSelector(selectMainToken)

	const { data, columns, reloadData } = useTableData({
		selector: selectPublisherReceiptsStatsTableData,
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
	console.log('data', data)
	const options = getOptions({ decimals, symbol, reloadData })

	return (
		<MUIDataTableEnhanced
			title={t('ALL_CAMPAIGNS')}
			data={data}
			columns={columns}
			options={options}
			rowSelectable
			toolbarEnabled
			{...props}
		/>
	)
}

export default PublisherReceiptsTable
