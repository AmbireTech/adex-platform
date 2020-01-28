import React from 'react'
import PropTypes from 'prop-types'
import { t, selectCampaignAnalytics, selectMainToken } from 'selectors'
import MUIDataTableEnchanced from 'components/dashboard/containers/Tables/MUIDataTableEnchanced'
import { useSelector } from 'react-redux'
import { sliderFilterOptions } from './commonFilters'
import { formatNumberWithCommas } from 'helpers/formatters'

const IMPRESSION = 'IMPRESSION'
const CLICK = 'CLICK'
function CampaignStatsBreakdownTable(props) {
	const { symbol } = useSelector(selectMainToken)
	const { campaignId } = props
	const campaingAnalytics = useSelector(selectCampaignAnalytics)
	const getTableData = () => {
		// (IMPRESSION | CLICK).byChannelStats["0x80b2d99df436d53660737d51b8a130d053279b46cb2ac9ba91dd79b34dab6687"]
		const results = []
		const campaign = type => campaingAnalytics[type].byChannelStats[campaignId]
		const imprStats = campaign(IMPRESSION).reportChannelToHostname
		const clickStats = campaign(CLICK).reportChannelToHostname
		const earnStats = campaign(IMPRESSION).reportChannelToHostnamePay
		Object.keys(imprStats).map(key => {
			results.push({
				website: key,
				impressions: imprStats[key] || 0,
				earnings: Number((earnStats[key] || 0).toFixed(2)),
				clicks: clickStats[key] || 0,
			})
		})
		return results
	}
	const data = getTableData()
	const columns = [
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
			label: t('CHART_LABEL_IMPRESSIONS'),
			options: {
				sortDirection: 'desc',
				customBodyRender: impressions =>
					formatNumberWithCommas(impressions || 0),
				...sliderFilterOptions({
					initial: [
						0,
						Math.max(
							...Object.values(data).map(i => Number(i.impressions || 0))
						),
					],
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
					initial: [
						0,
						Math.max(...Object.values(data).map(i => Number(i.earnings || 0))),
					],
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
					initial: [
						0,
						Math.max(...Object.values(data).map(i => Number(i.clicks || 0))),
					],
					filterTitle: t('CLICKS_FILTER'),
				}),
			},
		},
	]
	return (
		<MUIDataTableEnchanced
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
