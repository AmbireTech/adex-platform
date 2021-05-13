import React, { useState, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { Grid, Button, CircularProgress, Box, Tooltip } from '@material-ui/core'
import { BlockSharp, CheckSharp } from '@material-ui/icons'
import {
	t,
	selectCampaignStatsTableData,
	selectCampaignStatsMaxValues,
	selectMainToken,
	selectSpinnerById,
} from 'selectors'
import MUIDataTableEnhanced from 'components/dashboard/containers/Tables/MUIDataTableEnhanced'
import { useSelector } from 'react-redux'
import { sliderFilterOptions } from './commonFilters'
import { formatNumberWithCommas, toFixedFloat } from 'helpers/formatters'
import { useTableData } from './tableHooks'
import { execute, excludeOrIncludeWebsites, confirmAction } from 'actions'

const useStyles = makeStyles(theme => ({
	wrapper: {
		margin: theme.spacing(1),
		position: 'relative',
	},
	buttonProgress: {
		position: 'absolute',
		top: '50%',
		left: '50%',
		marginTop: -12,
		marginLeft: -12,
	},
}))

const getCols = ({
	symbol,
	maxClicks,
	maxImpressions,
	maxEarnings,
	maxCTR,
}) => [
	{
		name: 'isBlacklisted',
		options: {
			filter: false,
			sort: false,
			download: false,
			display: false,
		},
	},
	{
		// NOTE: hidden - used for selected items
		name: 'website',
		options: {
			filter: false,
			sort: false,
			download: false,
			display: false,
		},
	},
	{
		name: 'website',
		label: t('WEBSITE'),
		options: {
			filter: true,
			sort: true,
			customBodyRender: (key, tableMeta) => {
				return tableMeta.rowData[0] ? (
					<Tooltip arrow key={key} title={t('WEBSITE_IS_EXCLUDED')}>
						<Box color='error.main'>{key}</Box>
					</Tooltip>
				) : (
					<Box>{key}</Box>
				)
			},
		},
	},
	{
		name: 'impressions',
		label: t('LABEL_IMPRESSIONS'),
		options: {
			sort: true,
			customBodyRender: impressions => formatNumberWithCommas(impressions || 0),
			...sliderFilterOptions({
				initial: [0, maxImpressions],
				filterTitle: t('IMPRESSIONS_FILTER'),
			}),
		},
	},
	{
		name: 'earnings',
		label: t('WEBSITE_EARNINGS'),
		options: {
			customBodyRender: earnings =>
				`${formatNumberWithCommas((earnings || 0).toFixed(2))} ${symbol}`,
			...sliderFilterOptions({
				initial: [0, toFixedFloat(maxEarnings, 2)],
				filterTitle: t('EARNINGS_FILTER'),
			}),
		},
	},
	{
		name: 'averageCPM',
		label: t('LABEL_AVERAGE_CPM'),
		options: {
			filter: false,
			customBodyRender: averageCPM =>
				`${formatNumberWithCommas((averageCPM || 0).toFixed(2))} ${symbol}`,
		},
	},
	{
		name: 'clicks',
		label: t('CHART_LABEL_CLICKS'),
		options: {
			sort: true,
			customBodyRender: clicks => formatNumberWithCommas(clicks || 0),
			...sliderFilterOptions({
				initial: [0, maxClicks],
				filterTitle: t('CLICKS_FILTER'),
			}),
		},
	},
	{
		name: 'ctr',
		label: t('CTR'),
		options: {
			sort: true,
			customBodyRender: ctr => `${ctr.toFixed(4)} %`,
			...sliderFilterOptions({
				initial: [0, toFixedFloat(maxCTR, 4)],
				filterTitle: t('CTR_FILTER'),
				stepsCount: 20,
				stepsPrecision: 4,
			}),
		},
	},
]

const IncludeOrExcludeWebsitesBtn = ({
	action,
	exclude,
	hostnames = [],
	campaignId,
	icon,
	color,
	onSuccess,
}) => {
	const classes = useStyles()
	const spinner = useSelector(state =>
		selectSpinnerById(state, `${action}-campaign-${campaignId}`)
	)
	return (
		<div className={classes.wrapper}>
			<Button
				variant='contained'
				color={color}
				size='medium'
				fullWidth
				onClick={() => {
					execute(
						confirmAction(
							() =>
								execute(
									excludeOrIncludeWebsites({
										campaignId,
										hostnames,
										exclude,
										action,
										onSuccess,
									})
								),
							null,
							{
								confirmLabel: t(`${action}_WEBSITES_ACTION_LABEL`),
								cancelLabel: t('CANCEL'),
								title: t(`${action}_WEBSITES_CONFIRM_TITLE`, {
									args: [hostnames.length],
								}),
								text: t(`${action}_WEBSITES_CONFIRM_INFO`, {
									args: [hostnames.length],
								}),
							}
						)
					)
				}}
				disabled={spinner}
				endIcon={icon}
			>
				{t(`BTN_${action}_WEBSITES`)}
			</Button>
			{spinner && (
				<CircularProgress size={24} className={classes.buttonProgress} />
			)}
		</div>
	)
}

const WebsitesActions = ({ campaignId, hostnames = [], onSuccess }) => {
	return (
		<Grid container spacing={1} alignItems='center'>
			<Grid item xs={12} sm={6} md={12} lg={6}>
				<IncludeOrExcludeWebsitesBtn
					action='EXCLUDE'
					hostnames={hostnames}
					exclude={true}
					campaignId={campaignId}
					icon={<BlockSharp />}
					onSuccess={onSuccess}
				/>
			</Grid>
			<Grid item xs={12} sm={6} md={12} lg={6}>
				<IncludeOrExcludeWebsitesBtn
					color='secondary'
					action='INCLUDE'
					hostnames={hostnames}
					campaignId={campaignId}
					icon={<CheckSharp />}
					onSuccess={onSuccess}
				/>
			</Grid>
		</Grid>
	)
}

const getOptions = ({ campaignId }) => ({
	filterType: 'multiselect',
	sortOrder: {
		name: 'impressions',
		direction: 'desc',
	},
	selectableRows: 'none',
	rowsPerPage: 25,
	customToolbarSelect: (selectedRows, displayData, setSelectedRows) => {
		const selectedIndexes = selectedRows.data.map(i => i.dataIndex)
		const hostnames = displayData
			.filter(item => selectedIndexes.includes(item.dataIndex) && item.data[1])
			.map(item => item.data[1])

		const actionData = {
			campaignId,
			hostnames,
			onSuccess: () => {
				setSelectedRows([])
			},
		}

		return <WebsitesActions {...actionData} />
	},
})

function CampaignStatsBreakdownTable({
	campaignId,
	isActive,
	canSendMsgs,
	tableId,
}) {
	const { symbol } = useSelector(selectMainToken)

	const { maxClicks, maxImpressions, maxEarnings, maxCTR } = useSelector(
		state => selectCampaignStatsMaxValues(state, campaignId)
	)

	const [options, setOptions] = useState({})

	const getColumns = useCallback(
		() => getCols({ symbol, maxClicks, maxImpressions, maxEarnings, maxCTR }),
		[maxCTR, maxClicks, maxEarnings, maxImpressions, symbol]
	)

	const allowActions = isActive && canSendMsgs

	const { data, columns } = useTableData({
		selector: selectCampaignStatsTableData,
		selectorArgs: campaignId,
		getColumns,
	})

	useEffect(() => {
		setOptions(getOptions({ campaignId, isActive, canSendMsgs }))
	}, [campaignId, canSendMsgs, isActive])

	return (
		<MUIDataTableEnhanced
			tableId={tableId}
			title={t('CAMPAIGN_STATS_BREAKDOWN')}
			data={data}
			columns={columns}
			options={options}
			rowSelectable={allowActions}
			toolbarEnabled
		/>
	)
}

CampaignStatsBreakdownTable.propTypes = {
	campaignId: PropTypes.string.isRequired,
}

export default CampaignStatsBreakdownTable
