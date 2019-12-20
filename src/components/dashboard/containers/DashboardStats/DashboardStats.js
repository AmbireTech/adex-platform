import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { execute, updateNav } from 'actions'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import classnames from 'classnames'
import SideSelect from 'components/signin/side-select/SideSelect'
import StatsCard from './StatsCard'
import { styles } from './styles'
import Grid from '@material-ui/core/Grid'
import { BasicStats } from './BasicStats'
import { push } from 'connected-react-router'
import { t, selectSide, selectAccountStatsFormatted } from 'selectors'

const useStyles = makeStyles(styles)

export function DashboardStats(props) {
	const side = useSelector(selectSide)
	const classes = useStyles()
	const {
		availableIdentityBalanceDai,
		outstandingBalanceDai,
	} = useSelector(selectAccountStatsFormatted)

	useEffect(() => {
		execute(updateNav('navTitle', t('DASHBOARD')))
	}, [])

	const goToAccount = () => {
		execute(push('/dashboard/' + side + '/account'))
	}

	const InfoStats = () => {
		return (
			<div className={classes.infoStatsContainer}>
				<StatsCard
					linkCard
					onClick={goToAccount}
					subtitle={t('IDENTITY_DAI_BALANCE_AVAILABLE_INFO', {
						args: [outstandingBalanceDai || 0],
					})}
					loading={
						(!outstandingBalanceDai && outstandingBalanceDai !== 0) ||
						(!availableIdentityBalanceDai && availableIdentityBalanceDai !== 0)
					}
					title={`${availableIdentityBalanceDai || 0} SAI`}
				></StatsCard>
			</div>
		)
	}

	return side !== 'advertiser' && side !== 'publisher' ? (
		<SideSelect active={true} />
	) : (
		<div>
			<Grid container>
				<Grid item md={12} lg={12} xs={12}>
					<Card className={classnames(classes.dashboardCardBody)}>
						<CardContent>
							<BasicStats side={side} />
						</CardContent>
					</Card>
				</Grid>
				<Grid item md={12} lg={6}>
					<InfoStats />
				</Grid>
			</Grid>
		</div>
	)
}

export default DashboardStats
