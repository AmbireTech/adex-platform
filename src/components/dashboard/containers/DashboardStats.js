
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { BidsStatusPie, BidsStatusBars } from 'components/dashboard/charts/slot'
import Translate from 'components/translate/Translate'
import { exchange as ExchangeConstants } from 'adex-constants'
import { List, ListItem, ListSubHeader, ListDivider } from 'react-toolbox/lib/list'
import { Card, CardMedia, CardTitle, CardText, CardActions } from 'react-toolbox/lib/card'
import classnames from 'classnames'

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

    componentWillMount() {
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
        const t = this.props.t

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
        return (
            <div>
                <BidsStatusPie
                    pieData={stats.pieData}
                    t={this.props.t}
                    options={{
                        title: {
                            display: true,
                            position: 'top',
                            text: this.props.t('TITLE_STATS_BY_BID_STATUS')
                        }
                    }}
                    onPieClick={(ev) => {
                        if (ev && !isNaN(ev._index)) {
                            this.props.history.push('/dashboard/' + this.props.side + '/bids/' + stats.tabs[ev._index])
                        }
                    }}

                />
            </div>
        )
    }

    // TODO: show more data here and format it
    InfoStats = ({ stats }) => {
        // console.log(stats)
        const t = this.props.t
        return (
            <div>

                <Card className={classnames(theme.dashboardCardHalf)}>
                    <CardTitle
                        subtitle={t('LABEL_SPENT_EARNED')}
                        title={stats.closed.completed.amount + ''}
                    />
                </Card>

                <Card className={classnames(theme.dashboardCardHalf)}>
                    <CardTitle
                        subtitle={t('LABEL_AWAITING_VERIFY')}
                        title={stats.action.amount + ''}
                    />
                </Card>
                <Card className={classnames(theme.dashboardCardHalf)}>
                    <CardTitle
                        subtitle={t('LABEL_ON_OPEN')}
                        title={stats.open.amount + ''}
                    />
                </Card>

            </div>
        )
    }

    render() {
        const stats = this.mapData(this.props.sideBids)
        return (
            <div>
                <Grid fluid >
                    <Row top='xs' className={theme.itemsListControls}>
                        <Col xs={12} sm={12} lg={6}>
                            <Card raised className={classnames(theme.dashboardCardBody)}>
                                <this.BidsStateChart
                                    stats={stats}
                                />
                            </Card>
                        </Col>
                        <Col xs={12} sm={12} lg={6}>
                            <this.InfoStats
                                stats={stats}
                            />
                        </Col>
                    </Row>
                </Grid>

            </div>
        )
    }
}

DashboardStats.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    bidsIds: PropTypes.array.isRequired
}

function mapStateToProps(state, props) {
    const persist = state.persist
    const memory = state.memory
    const side = memory.nav.side
    let sideBidsProp = ''
    if (side === 'publisher') {
        sideBidsProp = 'pubBids'
    } else if (side === 'advertiser') {
        sideBidsProp = 'advBids'
    }

    return {
        account: persist.account,
        bidsIds: persist.bids.bidsIds,
        side: memory.nav.side,
        sideBids: persist.bids[sideBidsProp] || {}
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
)(Translate(DashboardStats))
