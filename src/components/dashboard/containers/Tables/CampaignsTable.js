import React from 'react'
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
} from 'selectors'
import { makeStyles } from '@material-ui/core/styles'
import { bigNumberify, commify } from 'ethers/utils'
import { useSelector } from 'react-redux'
import { styles } from './styles'
import { formatDateTime, formatTokenAmount } from 'helpers/formatters'
import { sliderFilterOptions } from './commonFilters'
import { useTableData } from './tableHooks'
import { ReloadData } from './toolbars'
const RRIconButton = withReactRouterLink(IconButton)

const useStyles = makeStyles(styles)

const getCols = ({
	classes,
	symbol,
	maxImpressions,
	maxDeposit,
	maxClicks,
}) => [
	{
		name: 'media',
		label: t('PROP_MEDIA'),
		options: {
			filter: false,
			sort: false,
			customBodyRender: ({ id, adUnits }) => {
				return (
					// TODO: Images issue some stop displaying
					<Img
						fullScreenOnClick={true}
						className={classnames(classes.cellImg)}
						src={adUnits[0].mediaUrl}
						alt={id}
						mediaMime={adUnits[0].mediaMime}
						allowVideo
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
			customBodyRender: ({ humanFriendlyName, originalName }) => (
				<React.Fragment>
					{humanFriendlyName}{' '}
					{mapStatusIcons(humanFriendlyName, originalName, 'xs')}
				</React.Fragment>
			),
			// TODO: Sorting issue
		},
	},
	{
		name: 'depositAmount',
		label: t('PROP_DEPOSIT'),
		options: {
			sort: true,
			customBodyRender: depositAmount => (
				<React.Fragment>{`${depositAmount.toFixed(
					2
				)} ${symbol}`}</React.Fragment>
			),
			...sliderFilterOptions({
				initial: [0, maxDeposit],
				filterTitle: t('DEPOSIT_FILTER'),
			}),
		},
	},
	{
		name: 'fundsDistributedRatio',
		label: t('PROP_DISTRIBUTED'),
		options: {
			sort: true,
			customBodyRender: fundsDistributedRatio =>
				`${((fundsDistributedRatio || 0) / 10).toFixed(2)}%`,
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
		name: 'minPerImpression',
		label: t('PROP_CPM'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: minPerImpression => (
				<React.Fragment>{`${minPerImpression.toFixed(
					2
				)} ${symbol}`}</React.Fragment>
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
			customBodyRender: created => formatDateTime(created),
		},
	},
	{
		name: 'activeFrom',
		label: t('PROP_STARTS'),
		options: {
			filter: false,
			sort: true,
			customBodyRender: activeFrom => formatDateTime(activeFrom),
		},
	},
	{
		name: 'withdrawPeriodStart',
		label: t('PROP_ENDS'),
		options: {
			filter: false,
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
			customBodyRender: ({ side, id, humanFriendlyName }) => (
				<React.Fragment>
					<Tooltip
						title={t('LABEL_VIEW')}
						// placement='top'
						enterDelay={1000}
					>
						<RRIconButton
							to={`/dashboard/${side}/Campaign/${id}`}
							variant='contained'
							aria-label='preview'
						>
							<Visibility color='primary' />
						</RRIconButton>
					</Tooltip>
					{humanFriendlyName === 'Closed' ||
						(humanFriendlyName === 'Completed' && (
							<Tooltip
								title={t('RECEIPT_VIEW')}
								// placement='top'
								enterDelay={1000}
							>
								<RRIconButton
									to={`/dashboard/${side}/Campaign/receipt/${id}`}
									variant='contained'
									aria-label='receip'
								>
									<Receipt color='primary' />
								</RRIconButton>
							</Tooltip>
						))}
				</React.Fragment>
			),
		},
	},
]

const onDownload = (buildHead, buildBody, columns, data, decimals, symbol) => {
	const mappedData = data.map(i => ({
		index: i.index,
		data: [
			i.data[0].id,
			i.data[1].humanFriendlyName,
			`${formatTokenAmount(
				bigNumberify(i.data[2]).mul(1000),
				decimals,
				true
			)} ${symbol}`,
			`${((i.data[3] || 0) / 10).toFixed(2)}%`,
			i.data[4],
			i.data[5],
			`${formatTokenAmount(
				bigNumberify(i.data[6]).mul(1000),
				decimals,
				true
			)} ${symbol}`,
			formatDateTime(i.data[7]),
			formatDateTime(i.data[8]),
			formatDateTime(i.data[9]),
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
})

function CampaignsTable(props) {
	const classes = useStyles()
	const side = useSelector(selectSide)
	const maxImpressions = useSelector(selectCampaignsMaxImpressions)
	const maxClicks = useSelector(selectCampaignsMaxClicks)
	const maxDeposit = useSelector(selectCampaignsMaxDeposit)
	const { symbol, decimals } = useSelector(selectMainToken)

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
			{...props}
		/>
	)
}

export default CampaignsTable
