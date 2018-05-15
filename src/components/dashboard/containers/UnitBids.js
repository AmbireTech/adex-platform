import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import { Tab, Tabs } from 'react-toolbox'
import { IconButton } from 'react-toolbox/lib/button'
import ItemsList from './ItemsList'
import Rows from 'components/dashboard/collection/Rows'
import Translate from 'components/translate/Translate'
import Tooltip from 'react-toolbox/lib/tooltip'
import RTButtonTheme from 'styles/RTButton.css'
import { exchange as ExchangeConstants } from 'adex-constants'
import { CancelBid, VerifyBid, RefundBid } from 'components/dashboard/forms/web3/transactions'
import classnames from 'classnames'
import { SORT_PROPERTIES_BIDS, FILTER_PROPERTIES_BIDS } from 'constants/misc'
import { getCommonBidData, renderCommonTableRow, renderTableHead, searchMatch, getAdvertiserBidData, getBidData } from './BidsCommon'
import { getAddrBids } from 'services/store-data/bids'

const TooltipIconButton = Tooltip(IconButton)
const { BID_STATES } = ExchangeConstants

export class UnitBids extends Component {
    constructor(props) {
        super(props)
        this.state = {
            tabIndex: 0,
            detailsOpen: false
        }
    }

    handleTabChange = (index) => {
        this.setState({ tabIndex: index })
    }

    shouldComponentUpdate(nextProps, nextState) {
        // TODO: investigate why component receives props without change in the parent components and stre state props
        return (JSON.stringify(this.props) !== JSON.stringify(nextProps)) || (JSON.stringify(this.state) !== JSON.stringify(nextState))
    }

    onSave = () => {
        if (this.props.getUnitBids) {
            this.props.getUnitBids()
        } else {
            getAddrBids({ authSig: this.props.account._authSig })
        }
    }

    renderTableRow = (bid, index, { to, selected }) => {
        const t = this.props.t
        const bidData = getBidData({
            bid: bid,
            t: t,
            transactions: this.props.transactions,
            side: this.props.side,
            item: this.props.item,
            account: this.props.account,
            onSave: this.onSave
        })

        return renderCommonTableRow({ bidData, t })
    }

    renderRows = (items) =>
        <Rows
            multiSelectable={false}
            selectable={false}
            side={this.props.side}
            item={{}}
            rows={items}
            rowRenderer={this.renderTableRow.bind(this)}
            tableHeadRenderer={renderTableHead.bind(this, { t: this.props.t, side: this.props.side })}
        />

    render() {
        let t = this.props.t
        let sorted = null

        if (this.props.getUnitBids) {
            sorted = this.props.bids || {}
        } else {
            sorted = this.props.advBids || {}
        }

        return (
            <div>
                {this.props.getUnitBids ? null :
                    <div className={classnames(theme.heading, theme.Transactions)}>
                        <h2 > {t('ALL_BIDS')} </h2>
                    </div>
                }
                <Tabs
                    theme={theme}
                    index={this.state.tabIndex}
                    onChange={this.handleTabChange}
                >
                    <Tab label={t('BIDS_READY_TO_VERIFY')}>
                        <ItemsList
                            items={sorted.action}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                        />
                    </Tab>
                    <Tab label={t('BIDS_ACTIVE')}>
                        <ItemsList
                            items={sorted.active}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                        />
                    </Tab>
                    <Tab label={t('BIDS_OPEN')}>
                        <ItemsList
                            items={sorted.open}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                        />
                    </Tab>
                    <Tab label={t('BIDS_CLOSED')}>
                        <ItemsList
                            items={sorted.closed}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                        />
                    </Tab>
                    <Tab label={t('STATISTICS')}>
                        <div>
                            {t('COMING_SOON')}
                            {/* {this.renderNonOpenedBidsChart(slotBids)} */}
                        </div>
                    </Tab>
                </Tabs>

            </div>
        )
    }
}

UnitBids.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    getUnitBids: PropTypes.func
}

function mapStateToProps(state) {
    const persist = state.persist
    const memory = state.memory
    return {
        account: persist.account,
        transactions: persist.web3Transactions[persist.account._addr] || {},
        advBids: persist.bids.advBids,
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
)(Translate(UnitBids))
