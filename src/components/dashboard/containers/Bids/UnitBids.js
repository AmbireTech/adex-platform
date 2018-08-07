import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import ListWithControls from 'components/dashboard/containers/Lists/ListWithControls'
import Rows from 'components/dashboard/collection/Rows'
import Translate from 'components/translate/Translate'
// import classnames from 'classnames'
import { SORT_PROPERTIES_BIDS, FILTER_PROPERTIES_BIDS } from 'constants/misc'
import { BidCommonTableRow, renderTableHead, searchMatch, getBidData } from './BidsCommon'
import { getAddrBids } from 'services/store-data/bids'
import BidsStatistics from './BidsStatistics'
import AppBar from '@material-ui/core/AppBar'

export class UnitBids extends Component {
    constructor(props) {
        super(props)

        let tabParam = props.match && props.match.params ? props.match.params.tab : null
        let tabIndex = this.getTabIndex(tabParam)

        this.state = {
            tabIndex: tabIndex || 0,
            detailsOpen: false
        }
    }

    componentWillMount() {
        if (!this.props.getUnitBids) {
            this.props.actions.updateNav('navTitle', this.props.t('ALL_BIDS'))
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

    handleTabChange = (event, index) => {
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

        return <BidCommonTableRow bidData={bidData} t={t} key={bidData._id} />
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
        const { t } = this.props
        let sorted = null

        if (this.props.getUnitBids) {
            sorted = this.props.bids || {}
        } else {
            sorted = this.props.advBids || {}
        }

        const { tabIndex } = this.state

        return (
            <div>
                <AppBar
                    position='static'
                    color='default'
                >
                    <Tabs
                        value={tabIndex}
                        onChange={this.handleTabChange}
                        scrollable
                        scrollButtons='off'
                        indicatorColor='primary'
                        textColor='primary'
                    >
                        <Tab label={t('BIDS_READY_TO_VERIFY')} />
                        <Tab label={t('BIDS_ACTIVE')} />
                        <Tab label={t('BIDS_OPEN')} />
                        <Tab label={t('BIDS_CLOSED')} />
                        <Tab label={t('STATISTICS')} />
                    </Tabs>
                </AppBar>
                <div
                    style={{ marginTop: 10 }}
                >
                    {
                        !!(tabIndex === 0) &&
                        <ListWithControls
                            items={sorted.action}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                        />
                    }
                    {
                        !!(tabIndex === 1) &&
                        <ListWithControls
                            items={sorted.active}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                        />
                    }
                    {
                        !!(tabIndex === 2) &&
                        <ListWithControls
                            items={sorted.open}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                        />
                    }
                    {
                        !!(tabIndex === 3) &&
                        <ListWithControls
                            items={sorted.closed}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                        />
                    }
                    {
                        !!(tabIndex === 4) &&
                        <BidsStatistics bids={sorted.action.concat(sorted.active, sorted.closed)} onSave={this.onSave} />
                    }
                </div>

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
