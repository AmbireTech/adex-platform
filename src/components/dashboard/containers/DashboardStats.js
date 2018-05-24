
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { BidsStatusPie } from 'components/dashboard/charts/slot'
import Translate from 'components/translate/Translate'
import { exchange as ExchangeConstants } from 'adex-constants'
import { Card, CardTitle, CardActions } from 'react-toolbox/lib/card'
import classnames from 'classnames'
import { adxToFloatView } from 'services/smart-contracts/utils'
import { web3Utils } from 'services/smart-contracts/ADX'
import SideSelect from 'components/signin/side-select/SideSelect'
import { Button } from 'react-toolbox/lib/button'

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

    goToBids = (tab) => {
        this.props.history.push('/dashboard/' + this.props.side + '/bids/' + tab)
    }

    goToAccount = () => {
        this.props.history.push('/dashboard/' + this.props.side + '/account')
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
                            this.goToBids(stats.tabs[ev._index])
                        }
                    }}

                />
            </div>
        )
    }

    // TODO: Common func to get account stats for here and account component
    InfoStats = ({ stats }) => {
        const t = this.props.t
        const side = this.props.side
        const spentEarned = side === 'publisher' ? 'LABEL_TOTAL_REVENUE' : 'LABEL_TOTAL_EXPENSES'


        const account = this.props.account
        const accStats = { ...account._stats } || {}
        const addrBalanceAdx = adxToFloatView(accStats.balanceAdx || 0)
        const addrBalanceEth = web3Utils.fromWei(accStats.balanceEth || '0', 'ether')
        const exchBal = accStats.exchangeBalance || {}
        const adxOnBids = adxToFloatView(exchBal.onBids || 0)
        const exchangeAvailable = adxToFloatView(exchBal.available || 0)
        return (
            <div>

                <Card
                    className={classnames(theme.dashboardCardHalf, theme.linkCard)}
                    onClick={() => this.goToBids('closed')}
                >
                    <CardTitle
                        subtitle={t(spentEarned)}
                        title={adxToFloatView(stats.closed.completed.amount || 0) + ' ADX'}
                    />
                </Card>

                <Card
                    className={classnames(theme.dashboardCardHalf, theme.linkCard)}
                    onClick={() => this.goToBids('action')}
                >
                    <CardTitle
                        subtitle={t('LABEL_AMOUNT_READY_TO_VERIFY')}
                        title={adxToFloatView(stats.action.amount || 0) + ' ADX'}
                    />
                    {/* <CardActions theme={theme}>
                        <Button label="Action 1" />
                    </CardActions> */}
                </Card>
                {side === 'advertiser' ?
                    <Card
                        className={classnames(theme.dashboardCardHalf, theme.linkCard)}
                        onClick={() => this.goToBids('open')}
                    >
                        <CardTitle
                            subtitle={t('LABEL_OPEN_BIDS_AMOUNT')}
                            title={adxToFloatView(stats.open.amount || 0) + ' ADX'}
                        />
                    </Card>
                    : null}

                <Card
                    className={classnames(theme.dashboardCardHalf, theme.linkCard)}
                    onClick={this.goToAccount}
                >
                    <CardTitle
                        subtitle={t('ACCOUNT_ETH_BALANCE')}
                        title={addrBalanceEth + ' ETH'}
                    />
                </Card>


                <Card
                    className={classnames(theme.dashboardCardHalf, theme.linkCard)}
                    onClick={this.goToAccount}
                >
                    <CardTitle
                        subtitle={t('ACCOUNT_ADX_BALANCE')}
                        title={addrBalanceAdx + ' ADX'}
                    />
                </Card>

                <Card
                    className={classnames(theme.dashboardCardHalf, theme.linkCard)}
                    onClick={this.goToAccount}
                >
                    <CardTitle
                        subtitle={t('EXCHANGE_ADX_BALANCE_AVAILABLE')}
                        title={exchangeAvailable + ' ADX'}
                    />
                </Card>

                <Card
                    className={classnames(theme.dashboardCardHalf, theme.linkCard)}
                    onClick={this.goToAccount}
                >
                    <CardTitle
                        subtitle={t('EXCHANGE_ADX_BALANCE_ON_BIDS')}
                        title={adxOnBids + ' ADX'}
                    />
                </Card>

            </div>
        )
    }

    render() {
        if (this.props.side !== 'advertiser' && this.props.side !== 'publisher') {
            return (
                <SideSelect active={true} />
            )
        }

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
