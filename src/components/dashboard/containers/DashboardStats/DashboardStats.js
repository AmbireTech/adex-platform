import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions, { execute } from 'actions'
import Translate from 'components/translate/Translate'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import classnames from 'classnames'
import SideSelect from 'components/signin/side-select/SideSelect'
import { withStyles } from '@material-ui/core/styles'
import StatsCard from './StatsCard'
import { styles } from './styles'
import Grid from '@material-ui/core/Grid'
import { BasicStats } from './BasicStats'
import { push } from 'connected-react-router'

export class DashboardStats extends Component {
	goToAccount = () => {
		const { side } = this.props
		execute(push('/dashboard/' + side + '/account'))
	}

	componentDidMount() {
		const { actions, t } = this.props
		actions.updateNav('navTitle', t('DASHBOARD'))
	}

	// TODO: Common func to get account stats for here and account component
	InfoStats = ({ stats }) => {
		const {
			t,
			// side,
			account,
		} = this.props

		const formatted = account.stats.formatted || {}
		const {
			identityBalanceDai,
			outstandingBalanceDai,
			availableIdentityBalanceDai,
		} = formatted
		const classes = this.props.classes
		return (
			<div className={classes.infoStatsContainer}>
				<StatsCard
					linkCard
					onClick={this.goToAccount}
					subtitle={t('IDENTITY_DAI_BALANCE_AVAILABLE_INFO', {
						args: [identityBalanceDai || 0, outstandingBalanceDai || 0],
					})}
					loading={
						(!identityBalanceDai && identityBalanceDai !== 0) ||
						(!outstandingBalanceDai && outstandingBalanceDai !== 0) ||
						(!availableIdentityBalanceDai && availableIdentityBalanceDai !== 0)
					}
					title={`${availableIdentityBalanceDai || 0} DAI`}
				></StatsCard>
			</div>
		)
	}

	render() {
		const {
			side,
			// sideBids,
			classes,
		} = this.props
		if (side !== 'advertiser' && side !== 'publisher') {
			return <SideSelect active={true} />
		}

		// const stats = this.mapData(sideBids)

		return (
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
						<this.InfoStats
						// stats={stats}
						/>
					</Grid>
				</Grid>
			</div>
		)
	}
}

DashboardStats.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired,
}

function mapStateToProps(state, props) {
	const { persist, memory } = state

	return {
		account: persist.account,
		side: memory.nav.side,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch),
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(withStyles(styles)(Translate(DashboardStats)))
