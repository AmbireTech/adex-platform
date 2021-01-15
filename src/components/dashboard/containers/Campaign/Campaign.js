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
import { CampaignAudience } from './CampaignAudience'
import { validateAndUpdateCampaign, updateMemoryUi, execute } from 'actions'
import {
	useItem,
	ChangeControls,
	ItemTabsBar,
	ItemTabsContainer,
} from 'components/dashboard/containers/ItemCommon/'
import { CampaignStatsByTimeframe } from './CampaignStatsByTimeframe'
import PageNotFound from 'components/page_not_found/PageNotFound'

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
	const { status = {} } = item
	const canSendMsgs =
		status.name &&
		['Ready', 'Waiting', 'Active', 'Unhealthy'].includes(status.name) &&
		status.humanFriendlyName !== 'Closed'

	const isActive =
		status.humanFriendlyName === 'Active' ||
		status.humanFriendlyName === 'Paused'

	useEffect(() => {
		execute(updateMemoryUi('campaignId', campaignId))

		return () => {
			execute(updateMemoryUi('campaignId', undefined))
		}
	}, [campaignId])

	if (!campaignId) {
		return (
			<PageNotFound
				title={t('ITEM_NOT_FOUND', {
					args: ['CAMPAIGN', match.params.itemId || ''],
				})}
			/>
		)
	}

	return (
		<Fragment>
			<ItemTabsBar>
				<Tabs
					value={tabIndex}
					onChange={(ev, index) => setTabIndex(index)}
					variant='scrollable'
					scrollButtons='auto'
					indicatorColor='primary'
					textColor='primary'
				>
					<Tab label={t('CAMPAIGN_MAIN')} />
					<Tab label={t('CAMPAIGN_AUDIENCE')} />
					<Tab label={t('WEBSITE_STATS')} />
					<Tab label={t('COUNTRY_STATS')} />
					<Tab label={t('TIMEFRAME_STATS')} />
					<Tab label={t('CAMPAIGN_UNITS')} />
					<Tab label={t('VALIDATORS')} />
					{['Closed', 'Completed'].includes(humanFriendlyName) && (
						<Tab label={t('RECEIPT')} />
					)}
				</Tabs>
			</ItemTabsBar>
			<ChangeControls {...hookProps} />
			<ItemTabsContainer>
				{tabIndex === 0 && (
					<Box p={1}>
						<CampaignBasic
							item={item}
							{...hookProps}
							canSendMsgs={canSendMsgs}
							isActive={isActive}
						/>
					</Box>
				)}
				{tabIndex === 1 && (
					<Box p={1}>
						<CampaignAudience
							item={item}
							{...hookProps}
							canSendMsgs={canSendMsgs}
							isActive={isActive}
						/>
					</Box>
				)}
				{tabIndex === 2 && (
					<Box p={1}>
						{!dataLoaded && <LinearProgress />}
						<Box
							display='flex'
							flexDirection='row'
							flexWrap='wrap'
							flexGrow='1'
							justifyContent='center'
						>
							<Box flexGrow='1' order={{ xs: 2, md: 2, lg: 1 }}>
								<Paper variant='outlined'>
									<CampaignStatsBreakdownTable
										tableId={`campaignStatsBreakdown${campaignId}`}
										campaignId={campaignId}
										canSendMsgs={canSendMsgs}
										isActive={isActive}
									/>
								</Paper>
							</Box>
							<Box p={2} order={{ xs: 1, md: 1, lg: 2 }}>
								<CampaignStatsDoughnut campaignId={campaignId} />
							</Box>
						</Box>
					</Box>
				)}
				{tabIndex === 3 && (
					<Box p={1}>
						<Grid container spacing={1} alignItems='flex-start'>
							<Grid item xs={12}>
								<Box>
									<Typography variant='button' align='center'>
										{t('COUNTRY_STATS_PERIOD', { args: ['30', 'DAYS'] })}
									</Typography>
								</Box>
								{!dataLoaded && <LinearProgress />}
							</Grid>
							<Grid item xs={12} md={12} lg={6}>
								<MapChart
									selector={state =>
										selectCampaignAnalyticsToCountryMapChartData(
											state,
											campaignId
										)
									}
								/>
							</Grid>
							<Grid item xs={12} md={12} lg={6}>
								<Paper variant='outlined'>
									<StatsByCountryTable
										selector={selectCampaignAnalyticsToCountryTableData}
										selectorArgs={campaignId}
										tableId={`CampaignStatsByCountry${campaignId}`}
										showEarnings
									/>
								</Paper>
							</Grid>
						</Grid>
					</Box>
				)}

				{tabIndex === 4 && (
					<Box p={1}>
						<CampaignStatsByTimeframe item={item} />
					</Box>
				)}
				{tabIndex === 5 && (
					<AdUnitsTable
						tableId={`campaignUnits-${campaignId}`}
						campaignId={campaignId}
						noClone
					/>
				)}
				{tabIndex === 6 && (
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
				{tabIndex === 7 && <Receipt itemId={campaignId} />}
			</ItemTabsContainer>
		</Fragment>
	)
}

Campaign.propTypes = {
	match: PropTypes.object.isRequired,
}

export default Campaign
