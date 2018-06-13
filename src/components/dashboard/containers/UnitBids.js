import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import { Tab, Tabs } from 'react-toolbox'
import ListWithControls from './Lists/ListWithControls'
import Rows from 'components/dashboard/collection/Rows'
import Translate from 'components/translate/Translate'
import classnames from 'classnames'
import { SORT_PROPERTIES_BIDS, FILTER_PROPERTIES_BIDS } from 'constants/misc'
import { renderCommonTableRow, renderTableHead, searchMatch, getBidData } from './BidsCommon'
import { getAddrBids } from 'services/store-data/bids'
import BidsStatistics from './BidsStatistics'

export class UnitBids extends Component {
    constructor(props) {
        super(props)

        let tabParam = props.match && props.match.params ? props.match.params.tab : null
        let tabIndex = this.getTabIndex(tabParam)

        this.state = {
            tabIndex: tabIndex,
            detailsOpen: false
        }
    }

    getTabIndex = (tab) => {

        switch (tab) {
            case 'action':
                return 0
            case 'active':
                return 1
            case 'open':
                return 2
            case 'closed':
                return 3
            case 'statistics':
                return 4
            default:
                return 0
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
                        <ListWithControls
                            items={sorted.action}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                        />
                    </Tab>
                    <Tab label={t('BIDS_ACTIVE')}>
                        <ListWithControls
                            items={sorted.active}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                        />
                    </Tab>
                    <Tab label={t('BIDS_OPEN')}>
                        <ListWithControls
                            items={sorted.open}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                        />
                    </Tab>
                    <Tab label={t('BIDS_CLOSED')}>
                        <ListWithControls
                            items={sorted.closed}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                        />
                    </Tab>
                    <Tab label={t('STATISTICS')}>
                        <BidsStatistics bids={sorted.action.concat(sorted.active, sorted.closed)} onSave={this.onSave} />
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

function mapStateToProps(state, props) {

    console.log('props 1', props)
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
