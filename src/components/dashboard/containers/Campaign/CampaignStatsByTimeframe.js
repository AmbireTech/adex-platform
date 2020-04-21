import React, { Fragment } from 'react'
import { Paper, Grid, Box } from '@material-ui/core'

import { ItemSpecProp } from 'components/dashboard/containers/ItemCommon/'
import { BasicStats } from 'components/dashboard/containers/DashboardStats/BasicStats'
import { formatDateTime } from 'helpers/formatters'
import { t } from 'selectors'

export const CampaignStatsByTimeframe = ({ item }) => {
	return (
		<Fragment>
			<Paper elevation={2}>
				<Box p={1}>
					<Grid container spacing={0}>
						<Grid item xs={12} sm={4} md={4} lg={4}>
							<Box m={1}>
								<ItemSpecProp
									prop={'created'}
									value={formatDateTime(item.created)}
									label={t('created', { isProp: true })}
								/>
							</Box>
						</Grid>
						<Grid item xs={12} sm={4} md={4} lg={4}>
							<Box m={1}>
								<ItemSpecProp
									prop={'activeFrom'}
									value={formatDateTime(item.activeFrom)}
									label={t('activeFrom', { isProp: true })}
								/>
							</Box>
						</Grid>
						<Grid item xs={12} sm={4} md={4} lg={4}>
							<Box m={1}>
								<ItemSpecProp
									prop={'activeFrom'}
									value={formatDateTime(item.activeFrom)}
									label={t('activeFrom', { isProp: true })}
								/>
							</Box>
						</Grid>

						<Grid item xs={12}>
							<BasicStats campaignId={item.id} />
						</Grid>
					</Grid>
				</Box>
			</Paper>
		</Fragment>
	)
}
