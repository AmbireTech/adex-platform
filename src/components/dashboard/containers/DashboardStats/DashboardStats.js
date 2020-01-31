import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { execute, updateNav } from 'actions'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import classnames from 'classnames'
import SideSelect from 'components/signin/side-select/SideSelect'
import { styles } from './styles'
import Grid from '@material-ui/core/Grid'
import { BasicStats } from './BasicStats'
import { t, selectSide } from 'selectors'

const useStyles = makeStyles(styles)

export function DashboardStats(props) {
	const side = useSelector(selectSide)
	const classes = useStyles()

	useEffect(() => {
		execute(updateNav('navTitle', t('DASHBOARD')))
	}, [])

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
			</Grid>
		</div>
	)
}

export default DashboardStats
