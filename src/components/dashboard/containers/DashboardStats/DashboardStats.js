import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { BidsStatusPie } from 'components/dashboard/charts/slot'
import Translate from 'components/translate/Translate'
import { exchange as ExchangeConstants } from 'adex-constants'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import classnames from 'classnames'
import SideSelect from 'components/signin/side-select/SideSelect'
import { withStyles } from '@material-ui/core/styles'
import StatsCard from './StatsCard'
import { styles } from './styles'
import Grid from '@material-ui/core/Grid'
import { PublisherStats } from './PublisherStats'

const { BidStatesLabels, BID_STATES } = ExchangeConstants

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#EBE', '#FAC']

export class DashboardStats extends Component {

	constructor(props) {
		super(props)
		this.state = {
			bidsData: [],
			bidsStats: {}
		}
	}

	// goToBids = (tab) => {
	// 	this.props.history.push('/dashboard/' + this.props.side + '/bids/' + tab)
	// }

	goToAccount = () => {
		this.props.history.push('/dashboard/' + this.props.side + '/account')
	}

	componentDidMount() {
		this.props.actions.updateNav('navTitle', this.props.t('DASHBOARD'))
	}

	handleTabChange = (index) => {
		this.setState({ tabIndex: index })
	}

	mapBidsToStats = (bids, initialValue) => {
		return bids.reduce((memo, bid) => {
			memo.count += 1
			memo.amount += parseInt(bid._amount, 10)

			return memo
		}, { amount: 0, count: 0 })
	}

	mapClosedBidsToStats = (bids) => {
		return bids.reduce((memo, bid) => {
			switch (bid._state) {
			case BID_STATES.Canceled.id:
				memo.canceled.count += 1
				memo.canceled.amount += parseInt(bid._amount, 10)
				break
			case BID_STATES.Expired.id:
				memo.expired.count += 1
				memo.expired.amount += parseInt(bid._amount, 10)
				break
			case BID_STATES.Completed.id:
				memo.completed.count += 1
				memo.completed.amount += parseInt(bid._amount, 10)
				break
			default:
				break
			}

			return memo
		}, { completed: { amount: 0, count: 0 }, canceled: { amount: 0, count: 0 }, expired: { amount: 0, count: 0 } })
	}

	getLabel = (state, count, extraLabel) => {
		return this.props.t(BidStatesLabels[state]) + (extraLabel ? extraLabel : '') + ' [' + count + ']'
	}

	mapData = ({ action = [], active = [], closed = [], open = [] }) => {
		// NOTE: Ugly but with 1 loop  map all the needed data
		const PieLabels = []
		const PieDataCount = []
		const PieDataAmount = []
		const tabs = []
		let totalCount = 0

		const stats = {}
		// const { t } = this.props

		stats.action = this.mapBidsToStats(action)
		const actionCount = stats.action.count
		PieLabels.push(this.getLabel(BID_STATES.Accepted.id, actionCount, ' (' + this.props.t('BIDS_READY_TO_VERIFY') + ')'))
		PieDataCount.push(actionCount)
		PieDataAmount.push(stats.action.amount)
		totalCount += actionCount
		tabs.push('action')

		stats.active = this.mapBidsToStats(active)
		const activeCount = stats.active.count
		PieLabels.push(this.getLabel(BID_STATES.Accepted.id, activeCount, ' (' + this.props.t('BIDS_ACTIVE') + ')'))
		PieDataCount.push(activeCount)
		PieDataAmount.push(stats.active.amount)
		totalCount += activeCount
		tabs.push('active')

		stats.open = this.mapBidsToStats(open)
		const openCount = stats.open.count
		PieLabels.push(this.getLabel(BID_STATES.DoesNotExist.id, openCount))
		PieDataCount.push(openCount)
		PieDataAmount.push(stats.open.amount)
		totalCount += openCount
		tabs.push('open')

		stats.closed = this.mapClosedBidsToStats(closed)

		const completedCount = stats.closed.completed.count
		PieLabels.push(this.getLabel(BID_STATES.Completed.id, completedCount))
		PieDataCount.push(completedCount)
		PieDataAmount.push(stats.closed.completed.amount)
		totalCount += completedCount
		tabs.push('closed')

		const canceledCount = stats.closed.canceled.count
		PieLabels.push(this.getLabel(BID_STATES.Canceled.id, canceledCount))
		PieDataCount.push(canceledCount)
		PieDataAmount.push(stats.closed.canceled.amount)
		totalCount += canceledCount
		tabs.push('closed')

		const expiredCount = stats.closed.expired.count
		PieLabels.push(this.getLabel(BID_STATES.Expired.id, expiredCount))
		PieDataCount.push(expiredCount)
		PieDataAmount.push(stats.closed.expired.amount)
		totalCount += expiredCount
		tabs.push('closed')

		stats.pieData = {
			labels: PieLabels,
			data: PieDataCount,
			totalCount: totalCount
		}

		stats.tabs = tabs

		return stats
	}

	BidsStateChart = ({ stats }) => {
		const t = this.props.t

		return (
			<div>
				<BidsStatusPie
					pieData={stats.pieData}
					t={t}
					chartTitle={t('TITLE_STATS_BY_BID_STATUS')}
					onPieClick={(ev) => {
						if (ev && !isNaN(ev._index)) {
							this.goToBids(stats.tabs[ev._index])
						}
					}}
				/>
			</div>
		)
	}

	// TODO: Common func to get account stats for here and account component
	InfoStats = ({ stats }) => {
		const { t, side, account } = this.props
		const spentEarned = side === 'publisher' ? 'LABEL_TOTAL_REVENUE' : 'LABEL_TOTAL_EXPENSES'

		const formatted = account.stats.formatted || {}
		const {
			// walletAddress,
			// walletAuthType,
			// walletPrivileges,
			walletBalanceEth,
			walletBalanceDai,
			// identityAddress,
			identityBalanceDai,
			outstandingBalanceDai,
			totalIdentityBalanceDai

		} = formatted
		const classes = this.props.classes
		return (
			<div className={classes.infoStatsContainer}>
				{/* <StatsCard
					linkCard
					subtitle={t(spentEarned)}
					// title={adxToFloatView(stats.closed.completed.amount || 0) + ' ADX'}
					onClick={() => this.goToBids('closed')}
				>
				</StatsCard>

				<StatsCard
					linkCard
					onClick={() => this.goToBids('action')}
					subtitle={t('LABEL_AMOUNT_READY_TO_VERIFY')}
					// title={adxToFloatView(stats.action.amount || 0) + ' ADX'}
				>
				</StatsCard>

				{side === 'advertiser' &&
					<StatsCard
						linkCard
						onClick={() => this.goToBids('open')}
						subtitle={t('LABEL_OPEN_BIDS_AMOUNT')}
						// title={adxToFloatView(stats.open.amount || 0) + ' ADX'}
					>

					</StatsCard>
				} */}

				{/* <StatsCard
					linkCard
					onClick={this.goToAccount}
					subtitle={t('WALLET_ETH_BALANCE')}
					title={walletBalanceEth + ' ETH'}
				>
				</StatsCard>

				<StatsCard
					linkCard
					onClick={this.goToAccount}
					subtitle={t('WALLET_DAI_BALANCE')}
					title={walletBalanceDai + ' DAI'}
				>
				</StatsCard> */}

				<StatsCard
					linkCard
					onClick={this.goToAccount}
					subtitle={t('IDENTITY_DAI_BALANCE_AVAILABLE_INFO', {
						args: [identityBalanceDai, outstandingBalanceDai]
					})}
					title={totalIdentityBalanceDai + ' DAI'}
				>
				</StatsCard>
			</div>
		)
	}

	render() {
		const { side, sideBids, classes, t, account } = this.props
		if (side !== 'advertiser' && side !== 'publisher') {
			return (
				<SideSelect active={true} />
			)
		}

		// const stats = this.mapData(sideBids)

		return (
			<div>
				<Grid container>
					<Grid item md={12} lg={6} xs={12}>
						<Card
							className={classnames(classes.dashboardCardBody)}
						>
							<CardContent>
								{/* {t('NO_STATS_YET')} */}
								<PublisherStats aggregates={account.stats.raw.aggregates} t={t} />
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
		side: memory.nav.side
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(withStyles(styles)(Translate(DashboardStats)))
