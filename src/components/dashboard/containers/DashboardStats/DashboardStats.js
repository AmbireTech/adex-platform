import React, { useEffect, Fragment } from 'react'
import { useSelector } from 'react-redux'
import { execute, updateNav } from 'actions'
import { Box, Paper, Grid } from '@material-ui/core'
import SideSelect from 'components/signin/side-select/SideSelect'
import { BasicStats } from './BasicStats'
import { t, selectSide } from 'selectors'
import BestEarnersTable from '../Tables/BestEarnersTable'
import PublisherImprByCountry from '../Tables/PublisherImprByCountry'

export function DashboardStats(props) {
	const side = useSelector(selectSide)

	useEffect(() => {
		execute(updateNav('navTitle', t('DASHBOARD')))
	}, [])

	return side !== 'advertiser' && side !== 'publisher' ? (
		<SideSelect active={true} />
	) : (
		<Fragment>
			<Paper elevation={2}>
				<Box p={1}>
					<BasicStats side={side} />
				</Box>
			</Paper>
			<Box pt={2}>
				<Grid container spacing={2}>
					{side === 'publisher' && (
						<Fragment>
							<Grid item xs={12} md={12} lg={6}>
								<BestEarnersTable />
							</Grid>
							<Grid item xs={12} md={12} lg={6}>
								<PublisherImprByCountry />
							</Grid>
						</Fragment>
					)}
				</Grid>
			</Box>
		</Fragment>
	)
}

export default DashboardStats
