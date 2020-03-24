import React, { Fragment } from 'react'
import { Tooltip, IconButton } from '@material-ui/core'
import { Receipt } from '@material-ui/icons'
import MUIDataTableEnhanced from 'components/dashboard/containers/Tables/MUIDataTableEnhanced'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import {
	t,
	selectMainToken,
	selectSide,
	selectPublisherReceiptsMaxValues,
	selectPublisherReceiptsStatsTableData,
} from 'selectors'
import { makeStyles } from '@material-ui/core/styles'
import { commify } from 'ethers/utils'
import { execute, handlePrintSelectedReceiptsPublisher } from 'actions'
import { useSelector } from 'react-redux'
import { styles } from './styles'
import { formatDateTime } from 'helpers/formatters'
import { sliderFilterOptions } from './commonFilters'
import { useTableData } from './tableHooks'
import { ReloadData, PrintAllReceipts } from './toolbars'

const RRIconButton = withReactRouterLink(IconButton)

const useStyles = makeStyles(styles)

const getCols = ({ classes, symbol, maxImpressions, maxPayouts }) => [
	{
		name: 'startOfMonth',
		label: 'ID',
		options: {
			display: 'excluded',
			filter: false,
		},
	},
	{
		name: 'impressions',
		label: t('LABEL_IMPRESSIONS'),
		options: {
			filter: false,
			customBodyRender: impressions => commify(impressions || 0),
			...sliderFilterOptions({
				initial: [0, maxImpressions],
				filterTitle: t('IMPRESSIONS_FILTER'),
			}),
		},
	},
	{
		name: 'payouts',
		label: t('LABEL_TOTAL_PAYOUTS'),
		options: {
			filter: true,
			customBodyRender: payouts =>
				`${commify(payouts.toFixed(2) || 0)} ${symbol}`,
			...sliderFilterOptions({
				initial: [0, maxPayouts],
				filterTitle: t('PAYOUTS_FILTER'),
			}),
		},
	},
	{
		name: 'startOfMonth',
		label: t('RECEIPT_MONTH'),
		options: {
			filter: true,
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
			formatDateTime(i.data[3], 'MMMM, YYYY'),
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
					execute(handlePrintSelectedReceiptsPublisher(selectedItems))
				}
				disabled={selectedItems.length === 0}
			/>
		)
	},
})

function PublisherReceiptsTable(props) {
	const classes = useStyles()
	const side = useSelector(selectSide)
	const { maxImpressions, maxPayouts } = useSelector(
		selectPublisherReceiptsMaxValues
	)
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
				maxPayouts,
			}),
	})
	console.log('data', data)
	const options = getOptions({ decimals, symbol, reloadData })

	return (
		<MUIDataTableEnhanced
			title={t('RECEIPTS')}
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
