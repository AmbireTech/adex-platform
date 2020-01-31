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

const getCols = ({ symbol, maxClicks, maxImpressions, maxEarnings }) => [
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
]

function CampaignStatsBreakdownTable({ campaignId }) {
	const { symbol } = useSelector(selectMainToken)

	const { maxClicks, maxImpressions, maxEarnings } = useSelector(state =>
		selectCampaignStatsMaxValues(state, campaignId)
	)

	const { data, columns } = useTableData({
		selector: selectCampaignStatsTableData,
		selectorArgs: campaignId,
		getColumns: () =>
			getCols({ symbol, maxClicks, maxImpressions, maxEarnings }),
	})

	return (
		<MUIDataTableEnhanced
			title={t('CAMPAIGN_STATS_BREAKDOWN')}
			data={data}
			columns={columns}
			options={{
				filterType: 'multiselect',
				selectableRows: 'none',
				rowsPerPage: 25,
			}}
		/>
	)
}

CampaignStatsBreakdownTable.propTypes = {
	campaignId: PropTypes.string.isRequired,
}

export default CampaignStatsBreakdownTable
