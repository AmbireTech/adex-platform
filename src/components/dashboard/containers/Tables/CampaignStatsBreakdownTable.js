import React from 'react'
import PropTypes from 'prop-types'
import { t, selectCampaignAnalytics, selectMainToken } from 'selectors'
import MUIDataTableEnchanced from 'components/dashboard/containers/Tables/MUIDataTableEnchanced'
import { useSelector } from 'react-redux'
import { formatNumberWithCommas } from 'helpers/formatters'

const IMPRESSION = 'IMPRESSION'
const CLICK = 'CLICK'
function CampaignStatsBreakdownTable(props) {
	const { symbol } = useSelector(selectMainToken)
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
				filter: true,
				sort: true,
				sortDirection: 'desc',
				customFilterListOptions: {
					render: v => `${t('CHART_LABEL_IMPRESSIONS')}: >=${v}`,
				},
				filterOptions: {
					names: ['100', '200', '500', '1000'],
					logic: (impressions, filters) => {
						if (filters.length) return Number(impressions) <= Number(filters)
						return false
					},
				},
				filterType: 'dropdown',
			},
		},
		{
			name: 'earnings',
			label: t('WEBSITE_EARNINGS'),
			options: {
				filter: false,
				sort: true,
			},
		},
		{
			name: 'clicks',
			label: t('CHART_LABEL_CLICKS'),
			options: {
				filter: false,
				sort: true,
			},
		},
	]
	const { campaignId } = props
	const campaingAnalytics = useSelector(selectCampaignAnalytics)
	const getTableData = () => {
		//(IMPRESSION | CLICK).byChannelStats["0x80b2d99df436d53660737d51b8a130d053279b46cb2ac9ba91dd79b34dab6687"]
		const results = []
		const campaign = type => campaingAnalytics[type].byChannelStats[campaignId]
		const imprStats = campaign(IMPRESSION).reportChannelToHostname
		const clickStats = campaign(CLICK).reportChannelToHostname
		const earnStats = campaign(IMPRESSION).reportChannelToHostnamePay
		Object.keys(imprStats).map(key => {
			results.push({
				website: key,
				impressions: imprStats[key] || 0,
				earnings: `${(earnStats[key] || 0).toFixed(2)} ${symbol}`,
				clicks: clickStats[key] || 0,
			})
		})
		return results
	}
	const data = getTableData()
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
