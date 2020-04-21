import React, { useState, Fragment, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
	Grid,
	Box,
	Paper,
	List,
	ListItem,
	ListItemText,
	Typography,
} from '@material-ui/core'
import { AdUnitsTable } from 'components/dashboard/containers/Tables'
import { Campaign as CampaignModel } from 'adex-models'
import Anchor from 'components/common/anchor/anchor'
import {
	AdvertiserTab,
	AdvertiserTabs,
	AdvertiserAppBar,
} from 'components/styled'
import CampaignStatsDoughnut from 'components/dashboard/charts/campaigns/CampaignStatsDoughnut'
import CampaignStatsBreakdownTable from 'components/dashboard/containers/Tables/CampaignStatsBreakdownTable'
import { Receipt } from 'components/dashboard/containers/Receipt'
import {
	selectCampaignAnalyticsToCountryTableData,
	selectCampaignAnalyticsToCountryMapChartData,
	t,
} from 'selectors'
import StatsByCountryTable from 'components/dashboard/containers/Tables/StatsByCountryTable'
import MapChart from 'components/dashboard/charts/map/MapChart'
import { CampaignBasic } from './CampaignBasic'
import { validateAndUpdateCampaign, updateMemoryUi, execute } from 'actions'
import { useItem, SaveBtn } from 'components/dashboard/containers/ItemCommon/'
import { BasicStats } from 'components/dashboard/containers/DashboardStats/BasicStats'

function Campaign({ match }) {
	const [tabIndex, setTabIndex] = useState(0)
	const { item, ...hookProps } = useItem({
		itemType: 'Campaign',
		match,
		objModel: CampaignModel,
		validateAndUpdateFn: validateAndUpdateCampaign,
	})

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
			<SaveBtn {...hookProps} />
			<AdvertiserAppBar position='static'>
				<AdvertiserTabs
					value={tabIndex}
					onChange={(ev, index) => setTabIndex(index)}
					variant='scrollable'
					scrollButtons='auto'
				>
					<AdvertiserTab label={t('CAMPAIGN_MAIN')} />
					<AdvertiserTab label={t('WEBSITE_STAT')} />
					<AdvertiserTab label={t('COUNTRY_STATS')} />
					<AdvertiserTab label={t('CAMPAIGN_UNITS')} />
					<AdvertiserTab label={t('VALIDATORS')} />
					{['Closed', 'Completed'].includes(humanFriendlyName) && (
						<AdvertiserTab label={t('RECEIPT')} />
					)}
					<AdvertiserTab label={t('TIMEFRAME_STAT')} />
				</AdvertiserTabs>
			</AdvertiserAppBar>
			<Box my={2}>
				{tabIndex === 0 && <CampaignBasic item={item} {...hookProps} />}
				{tabIndex === 1 && (
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
				)}
				{tabIndex === 2 && (
					<Grid container spacing={2} alignItems='flex-start'>
						<Grid item xs={12}>
							<Paper>
								<Box p={2}>
									<Typography variant='button' align='center'>
										{t('COUNTRY_STATS_PERIOD', { args: ['30', 'DAYS'] })}
									</Typography>
								</Box>
							</Paper>
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
				{tabIndex === 3 && <AdUnitsTable campaignId={campaignId} noClone />}
				{tabIndex === 4 && (
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
				{tabIndex === 5 && <Receipt itemId={campaignId} />}
				{tabIndex === 6 && <BasicStats campaignId={campaignId} />}
			</Box>
		</Fragment>
	)
}

Campaign.propTypes = {
	match: PropTypes.object.isRequired,
}

export default Campaign
