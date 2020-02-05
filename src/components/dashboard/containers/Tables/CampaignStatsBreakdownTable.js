import React from 'react'
import PropTypes from 'prop-types'
import {
	t,
	selectCampaignStatsTableData,
	selectCampaignStatsMaxValues,
	selectMainToken,
} from 'selectors'
import MUIDataTableEnhanced from 'components/dashboard/containers/Tables/MUIDataTableEnhanced'
import { useSelector } from 'react-redux'
import { sliderFilterOptions } from './commonFilters'
import { formatNumberWithCommas } from 'helpers/formatters'
import { useTableData } from './tableHooks'
import { ReloadData } from './toolbars'

const getCols = ({
	symbol,
	maxClicks,
	maxImpressions,
	maxEarnings,
	maxCTR,
}) => [
	{
		name: 'website',
		label: t('WEBSITE'),
		options: {
			filter: true,
			sort: true,
		},
	},
	{
		name: 'impressions',
		label: t('LABEL_IMPRESSIONS'),
		options: {
			sortDirection: 'desc',
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
				`${formatNumberWithCommas(earnings || 0)} ${symbol}`,
			...sliderFilterOptions({
				initial: [0, maxEarnings],
				filterTitle: t('EARNINGS_FILTER'),
			}),
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
			customBodyRender: ctr => `${ctr}%`,
			...sliderFilterOptions({
				initial: [0, maxCTR],
				filterTitle: t('CTR_FILTER'),
				stepsCount: 20,
				stepsPrecision: 4,
			}),
		},
	},
]

const getOptions = ({ reloadData }) => ({
	filterType: 'multiselect',
	selectableRows: 'none',
	customToolbar: () => <ReloadData handleReload={reloadData} />,
	rowsPerPage: 20,
})

function CampaignStatsBreakdownTable({ campaignId }) {
	const { symbol } = useSelector(selectMainToken)

	const { maxClicks, maxImpressions, maxEarnings, maxCTR } = useSelector(
		state => selectCampaignStatsMaxValues(state, campaignId)
	)

	const { data, columns, reloadData } = useTableData({
		selector: selectCampaignStatsTableData,
		selectorArgs: campaignId,
		getColumns: () =>
			getCols({ symbol, maxClicks, maxImpressions, maxEarnings, maxCTR }),
	})

	const options = getOptions({ reloadData })

	return (
		<MUIDataTableEnhanced
			title={t('CAMPAIGN_STATS_BREAKDOWN')}
			data={data}
			columns={columns}
			options={options}
		/>
	)
}

CampaignStatsBreakdownTable.propTypes = {
	campaignId: PropTypes.string.isRequired,
}

export default CampaignStatsBreakdownTable
