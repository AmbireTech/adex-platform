
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import ListWithControls from 'components/dashboard/containers/Lists/ListWithControls'
import Rows from 'components/dashboard/collection/Rows'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Translate from 'components/translate/Translate'
import { getSlotBids, getAvailableBids } from 'services/adex-node/actions'
// import classnames from 'classnames'
import { SORT_PROPERTIES_BIDS, FILTER_PROPERTIES_BIDS, FILTER_PROPERTIES_BIDS_NO_STATE } from 'constants/misc'
import { BidCommonTableRow, renderTableHead, searchMatch, getBidData } from './BidsCommon'
import { getAddrBids, sortBids } from 'services/store-data/bids'
import BidsStatistics from './BidsStatistics'
import AppBar from '@material-ui/core/AppBar'
import Switch from '@material-ui/core/Switch'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormGroup from '@material-ui/core/FormGroup'

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#EBE', '#FAC']

export class SlotBids extends Component {

    constructor(props) {
        super(props)

        let tabParam = props.match && props.match.params ? props.match.params.tab : null
        let tabIndex = this.getTabIndex(tabParam)

        this.state = {
            tabIndex: tabIndex,
            bids: [],
            openBids: [],
            statsBids: [],
            filterByTags: false
        }
    }

    componentWillMount() {
        this.getBids()
        if (!this.props.getSlotBids) {
            this.props.actions.updateNav('navTitle', this.props.t('ALL_BIDS'))
        }
    }

    getTabIndex = (tab) => {

        const openBids = this.props.getSlotBids ? 0 : 1

        switch (tab) {
            case 'open':
                return 0
            case 'action':
                return 1 - openBids
            case 'active':
                return 2 - openBids
            case 'closed':
                return 3 - openBids
            case 'statistics':
                return 4 - openBids
            default:
                return 0
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        // TODO:
        return (JSON.stringify(this.props) !== JSON.stringify(nextProps)) || (JSON.stringify(this.state) !== JSON.stringify(nextState))
    }

    // TODO: map bid and set amount to number or make something to parse the amount in the items list sort function
    getBids = () => {
        if (this.props.getSlotBids) {
            getSlotBids({
                // authSig: this.props.account._authSig,
                adSlot: this.props.item._ipfs,
            })
                .then((bids) => {
                    this.setState({ bids: bids })
                })

            getAvailableBids({
                authSig: this.props.account._authSig,
                sizeAndType: this.props.item.sizeAndType,
                tags: this.props.item.tags || '',
                filterByTags: this.state.filterByTags
            })
                .then((bids) => {
                    this.setState({ openBids: bids })
                })
        } else {
            getAddrBids({ authSig: this.props.account._authSig })
        }
    }

    handleTabChange = (event, index) => {
        this.setState({ tabIndex: index })
    }

    handleTagsFilterChange = ev => {
        this.setState({ filterByTags: ev.target.checked }, this.getBids)
    }

    // TODO: make something common with unit bids
    renderTableRow(bid, index, { to, selected }) {
        let t = this.props.t
        const bidData = getBidData({
            bid: bid,
            t: t,
            transactions: this.props.transactions,
            side: this.props.side,
            item: this.props.item,
            account: this.props.account,
            onSave: this.getBids
        })

        return <BidCommonTableRow bidData={bidData} t={t} key={bidData._id} />
    }

    renderRows = (items) =>
        <Rows
            multiSelectable={false}
            selectable={false}
            side={this.props.side}
            item={items}
            rows={items}
            rowRenderer={this.renderTableRow.bind(this)}
            tableHeadRenderer={renderTableHead.bind(this, { t: this.props.t, side: this.props.side })}
        />

    render() {
        const openBids = this.state.openBids || []
        const { t, getSlotBids, pubBids } = this.props
        let sorted = []

        if (getSlotBids) {
            sorted = sortBids(this.state.bids || [])
        } else {
            sorted = pubBids
        }

        const { tabIndex, filterByTags } = this.state
        const indexShift = !!getSlotBids ? 1 : 0

        return (
            <div>
                <AppBar
                    position='static'
                    color='default'
                >
                    <Tabs
                        value={this.state.tabIndex}
                        onChange={this.handleTabChange}
                        scrollable
                        scrollButtons='off'
                        indicatorColor='primary'
                        textColor='primary'
                    >
                        {!!this.props.getSlotBids &&
                            <Tab label={t('OPEN_BIDS')} />
                        }
                        <Tab label={t('BIDS_READY_TO_VERIFY')} />
                        <Tab label={t('BIDS_ACTIVE')} />
                        <Tab label={t('BIDS_CLOSED')} />
                        <Tab label={t('STATISTICS')} />
                    </Tabs>
                </AppBar>
                <div
                    style={{ marginTop: 10 }}
                >
                    {
                        (!!this.props.getSlotBids && tabIndex === 0) &&
                        <div>
                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <Switch checked={filterByTags} onChange={this.handleTagsFilterChange} aria-label="FilterByTags" />
                                    }
                                    // TODO: translation
                                    label={filterByTags ? 'Filter by tags ON' : 'Filter by tags OFF'}
                                />
                            </FormGroup>
                            <ListWithControls
                                items={openBids}
                                listMode='rows'
                                renderRows={this.renderRows}
                                sortProperties={SORT_PROPERTIES_BIDS}
                                searchMatch={this.searchMatch}
                                filterProperties={FILTER_PROPERTIES_BIDS_NO_STATE}
                                uiStateId='slot-bids-open'
                            />
                        </div>
                    }
                    {
                        tabIndex === (0 + indexShift) &&
                        <ListWithControls
                            items={sorted.action}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                            uiStateId='slot-bids-action'
                        />
                    }
                    {
                        tabIndex === (1 + indexShift) &&
                        <ListWithControls
                            items={sorted.active}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                            uiStateId='slot-bids-active'
                        />
                    }
                    {
                        tabIndex === (2 + indexShift) &&
                        <ListWithControls
                            items={sorted.closed}
                            listMode='rows'
                            renderRows={this.renderRows.bind(this)}
                            sortProperties={SORT_PROPERTIES_BIDS}
                            searchMatch={this.searchMatch}
                            filterProperties={FILTER_PROPERTIES_BIDS}
                            uiStateId='slot-bids-closed'
                        />
                    }
                    {
                        tabIndex === (3 + indexShift) &&
                        <BidsStatistics bids={sorted.action.concat(sorted.active, sorted.closed)} onSave={this.getBids} />
                    }
                </div>
            </div>
        )
    }
}

SlotBids.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    item: PropTypes.object
}

function mapStateToProps(state, props) {
    const persist = state.persist
    const memory = state.memory
    return {
        account: persist.account,
        bids: persist.bids.bidsById,
        transactions: persist.web3Transactions[persist.account._addr] || {},
        pubBids: persist.bids.pubBids,
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
)(Translate(SlotBids))
