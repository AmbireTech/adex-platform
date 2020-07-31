import React from 'react'
import { Grid, Box } from '@material-ui/core'

import { ItemSpecProp } from 'components/dashboard/containers/ItemCommon/'
import { BasicStats } from 'components/dashboard/containers/DashboardStats/BasicStats'
import { formatDateTime } from 'helpers/formatters'
import { t } from 'selectors'

export const CampaignStatsByTimeframe = ({ item }) => {
	return (
		<Box>
			<Grid container spacing={1}>
				<Grid item xs={12} sm={4} md={4} lg={4}>
					<Box>
						<ItemSpecProp
							prop={'created'}
							value={formatDateTime(item.created)}
							label={t('created', { isProp: true })}
						/>
					</Box>
				</Grid>
				<Grid item xs={12} sm={4} md={4} lg={4}>
					<Box>
						<ItemSpecProp
							prop={'activeFrom'}
							value={formatDateTime(item.activeFrom)}
							label={t('activeFrom', { isProp: true })}
						/>
					</Box>
				</Grid>
				<Grid item xs={12} sm={4} md={4} lg={4}>
					<Box>
						<ItemSpecProp
							prop={'withdrawPeriodStart'}
							value={formatDateTime(item.withdrawPeriodStart)}
							label={t('withdrawPeriodStart', { isProp: true })}
						/>
					</Box>
				</Grid>

				<Grid item xs={12}>
					<BasicStats />
				</Grid>
			</Grid>
		</Box>
	)
}
