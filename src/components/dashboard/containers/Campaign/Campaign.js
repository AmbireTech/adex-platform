import React, { useState, Fragment, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import {
	Grid,
	Box,
	Paper,
	List,
	ListItem,
	ListItemText,
	Typography,
	Tabs,
	Tab,
	LinearProgress,
} from '@material-ui/core'
import { AdUnitsTable } from 'components/dashboard/containers/Tables'
import { Campaign as CampaignModel } from 'adex-models'
import Anchor from 'components/common/anchor/anchor'
import CampaignStatsDoughnut from 'components/dashboard/charts/campaigns/CampaignStatsDoughnut'
import CampaignStatsBreakdownTable from 'components/dashboard/containers/Tables/CampaignStatsBreakdownTable'
import { Receipt } from 'components/dashboard/containers/Receipt'
import {
	selectCampaignAnalyticsToCountryTableData,
	selectCampaignAnalyticsToCountryMapChartData,
	selectInitialDataLoadedByData,
	t,
} from 'selectors'
import StatsByCountryTable from 'components/dashboard/containers/Tables/StatsByCountryTable'
import MapChart from 'components/dashboard/charts/map/MapChart'
import { CampaignBasic } from './CampaignBasic'
import { validateAndUpdateCampaign, updateMemoryUi, execute } from 'actions'
import { useItem } from 'components/dashboard/containers/ItemCommon/'
import { CampaignStatsByTimeframe } from './CampaignStatsByTimeframe'

function Campaign({ match }) {
	const [tabIndex, setTabIndex] = useState(0)
	const { item, ...hookProps } = useItem({
		itemType: 'Campaign',
		match,
		objModel: CampaignModel,
		validateAndUpdateFn: validateAndUpdateCampaign,
	})
	const dataLoaded = useSelector(state =>
		selectInitialDataLoadedByData(state, 'advancedAnalytics')
	)

	const campaign = new CampaignModel(item)
	const { humanFriendlyName } = campaign.status || {}
	const leader = campaign.spec.validators[0]
	const follower = campaign.spec.validators[1]
	const campaignId = campaign.id

	useEffect(() => {
		execute(updateMemoryUi('campaignId', campaignId))

		return () => {
			execute(updateMemoryUi('campaignId', undefined))
		}
	}, [campaignId])

	return (
		<Fragment>
			<Paper variant='outlined'>
				<Tabs
					value={tabIndex}
					onChange={(ev, index) => setTabIndex(index)}
					variant='scrollable'
					scrollButtons='auto'
					indicatorColor='primary'
					textColor='primary'
				>
					<Tab label={t('CAMPAIGN_MAIN')} />
					<Tab label={t('WEBSITE_STATS')} />
					<Tab label={t('COUNTRY_STATS')} />
					<Tab label={t('TIMEFRAME_STATS')} />
					<Tab label={t('CAMPAIGN_UNITS')} />
					<Tab label={t('VALIDATORS')} />
					{['Closed', 'Completed'].includes(humanFriendlyName) && (
						<Tab label={t('RECEIPT')} />
					)}
				</Tabs>
			</Paper>
			<Box my={1}>
				{tabIndex === 0 && <CampaignBasic item={item} {...hookProps} />}
				{tabIndex === 1 && (
					<Box>
						{!dataLoaded && <LinearProgress />}
						<Box
							display='flex'
							flexDirection='row'
							flexWrap='wrap'
							flexGrow='1'
							justifyContent='center'
						>
							<Box flexGrow='1' order={{ xs: 2, md: 2, lg: 1 }}>
								<CampaignStatsBreakdownTable campaignId={campaignId} />
							</Box>
							<Box p={2} order={{ xs: 1, md: 1, lg: 2 }}>
								<CampaignStatsDoughnut campaignId={campaignId} />
							</Box>
						</Box>
					</Box>
				)}
				{tabIndex === 2 && (
					<Grid container spacing={1} alignItems='flex-start'>
						<Grid item xs={12}>
							<Paper variant='outlined'>
								<Box p={2}>
									<Typography variant='button' align='center'>
										{t('COUNTRY_STATS_PERIOD', { args: ['30', 'DAYS'] })}
									</Typography>
								</Box>
							</Paper>
							{!dataLoaded && <LinearProgress />}
						</Grid>
						<Grid item xs={12} md={12} lg={6}>
							<MapChart
								selector={state =>
									selectCampaignAnalyticsToCountryMapChartData(state, {
										campaignId,
									})
								}
							/>
						</Grid>
						<Grid item xs={12} md={12} lg={6}>
							<StatsByCountryTable
								selector={state =>
									selectCampaignAnalyticsToCountryTableData(state, {
										campaignId,
									})
								}
								showEarnings
							/>
						</Grid>
					</Grid>
				)}

				{tabIndex === 3 && <CampaignStatsByTimeframe item={item} />}
				{tabIndex === 4 && <AdUnitsTable campaignId={campaignId} noClone />}
				{tabIndex === 5 && (
					<List>
						<Anchor
							target='_blank'
							href={`${leader.url}/channel/${campaignId}/status`}
						>
							<ListItem button>
								<ListItemText primary={t('LEADER_STATUS')} />
							</ListItem>
						</Anchor>
						<Anchor
							target='_blank'
							href={`${leader.url}/channel/${campaignId}/last-approved?withHeartbeat=true`}
						>
							<ListItem button>
								<ListItemText primary={t('LEADER_LAST_APPROVED')} />
							</ListItem>
						</Anchor>
						<Anchor
							target='_blank'
							href={`${follower.url}/channel/${campaignId}/status`}
						>
							<ListItem button>
								<ListItemText primary={t('FOLLOWER_STATUS')} />
							</ListItem>
						</Anchor>
						<Anchor
							target='_blank'
							href={`${follower.url}/channel/${campaignId}/last-approved?withHeartbeat=true`}
						>
							<ListItem button>
								<ListItemText primary={t('FOLLOWER_LAST_APPROVED')} />
							</ListItem>
						</Anchor>
					</List>
				)}
				{tabIndex === 6 && <Receipt itemId={campaignId} />}
			</Box>
		</Fragment>
	)
}

Campaign.propTypes = {
	match: PropTypes.object.isRequired,
}

export default Campaign
