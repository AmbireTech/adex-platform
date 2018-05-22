
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

const { BidStatesLabels } = ExchangeConstants

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

    getData = ({ bids = { action: [], active: [], closed: [], open: [] } }) => {
    }

    // TODO: make 1 loop to get this data and the data for the other stats
    BidsStateChart = ({ bids = {} }) => {
        const allBids = (bids.action || []).concat(bids.active || [], bids.closed || [], bids.open || [])

        let statusData = allBids.reduce((memo, bid) => {
            if (bid) {
                let state = bid._state
                let states = memo.states
                let key = this.props.t(BidStatesLabels[state])

                // TODO: TEMP - fix it
                if ((bids.action || []).filter((b) => b._id === bid._id).length) {
                    key += (' (' + this.props.t('BIDS_READY_TO_VERIFY') + ')')
                } else if ((bids.active || []).filter((b) => b._id === bid._id).length) {
                    key += (' (' + this.props.t('BIDS_ACTIVE') + ')')
                }

                if (states[key] === undefined) {
                    states[key] = 1
                } else {
                    states[key] = (states[key] + 1)
                }

                return {
                    states: states
                }
            } else {
                return memo
            }
        }, { states: {} })

        // console.log('statusData', statusData)

        return (
            <div>
                <BidsStatusPie
                    data={statusData.states}
                    t={this.props.t}
                    options={{
                        title: {
                            display: true,
                            position: 'top',
                            text: this.props.t('TITLE_STATS_BY_BID_STATUS')
                        }
                    }}
                    onPieClick={(ev) => {
                        // console.log('ev', ev)
                        // this.props.history.push('/dashboard/' + this.props.side + '/bids/' + 1)
                    }}

                />
            </div>
        )
    }

    render() {
        console.log('props', this.props)
        return (
            <div>
                <Grid fluid >
                    <Row middle='xs' className={theme.itemsListControls}>
                        <Col xs={12} sm={12} md={6}>
                            <this.BidsStateChart
                                bids={this.props.sideBids}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={6}>
                            {/* <BidsStatusPie data={this.state.bidsStats} t={this.props.t} /> */}
                        </Col>
                        <Col xs={12} sm={12} md={6}>
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
    bidsIds: PropTypes.array.isRequired,

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
