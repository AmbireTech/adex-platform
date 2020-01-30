import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { Tooltip, IconButton } from '@material-ui/core'
import { Visibility } from '@material-ui/icons'
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
import { useSelector, useStore } from 'react-redux'
import { styles } from './styles'
import { formatDateTime, formatTokenAmount } from 'helpers/formatters'
import { sliderFilterOptions } from './commonFilters'
const RRIconButton = withReactRouterLink(IconButton)

const useStyles = makeStyles(styles)

const getCols = ({
	decimals,
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
				isToken: true,
				decimals,
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
			customBodyRender: ({ to }) => (
				<Tooltip
					title={t('LABEL_VIEW')}
					// placement='top'
					enterDelay={1000}
				>
					<RRIconButton to={to} variant='contained' aria-label='preview'>
						<Visibility color='primary' />
					</RRIconButton>
				</Tooltip>
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

const getOptions = ({ decimals, symbol }) => ({
	filterType: 'multiselect',
	selectableRows: 'none',
	// customSort,
	onDownload: (buildHead, buildBody, columns, data) =>
		onDownload(buildHead, buildBody, columns, data, decimals, symbol),
})

function CampaignsTable(props) {
	const classes = useStyles()
	const { getState } = useStore()
	const side = useSelector(selectSide)
	const [cols, setCols] = useState([])

	const [data, setData] = useState([])

	const maxImpressions = useSelector(selectCampaignsMaxImpressions)
	const maxClicks = useSelector(selectCampaignsMaxClicks)
	const maxDeposit = useSelector(selectCampaignsMaxDeposit)
	const { symbol, decimals } = useSelector(selectMainToken)
	const options = getOptions({ decimals, symbol })

	useEffect(() => {
		// NOTE: mui-datatables is rerendered allways by itself if data, columns (maybe options too) are changed
		// in order to prevent that data and columns are selected once on component mount and until page is changed
		// the data ill not be updated
		// TODO: think of better way to select from the state ones. This solution works but it is not as elegant as Ikea box.. :(
		const state = getState()
		setData(selectCampaignsTableData(state, side))
		setCols(
			getCols({
				decimals,
				classes,
				symbol,
				maxImpressions,
				maxClicks,
				maxDeposit,
			})
		)
	}, [
		classes,
		decimals,
		getState,
		maxClicks,
		maxDeposit,
		maxImpressions,
		setCols,
		setData,
		side,
		symbol,
	])

	return (
		<MUIDataTableEnhanced
			title={t('ALL_CAMPAIGNS')}
			data={data}
			columns={cols}
			options={options}
			{...props}
		/>
	)
}

CampaignsTable.propTypes = {
	campaignId: PropTypes.string.isRequired,
}

export default React.memo(CampaignsTable)
