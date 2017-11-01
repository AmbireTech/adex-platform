
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { ItemsTypes } from 'constants/itemsTypes'
import theme from './theme.css'
import { Table, TableHead, TableRow, TableCell } from 'react-toolbox/lib/table'
import { IconButton, Button } from 'react-toolbox/lib/button'
import ItemsList from './ItemsList'
import Rows from 'components/dashboard/collection/Rows'
import moment from 'moment'
import { BidState } from 'models/Bid'
import { Tab, Tabs } from 'react-toolbox'

const SORT_PROPERTIES = [
    { value: 'id', label: 'Id' },
    { value: 'advertiser', label: 'Advertiser' },
    { value: 'amount', label: 'Total reward' },
    { value: 'requiredExecTime', label: 'Expiration date' }
]

export class SlotBids extends Component {

    constructor(props) {
        super(props)
        this.state = {
            bidding: false,
            activeSlot: {},
            tabIndex: 0
        }
    }

    handleTabChange = (index) => {
        this.setState({ tabIndex: index })
    }

    renderTableHead() {
        return (
            <TableHead>
                <TableCell> {this.props.t('TOTAL_REWARD')} </TableCell>
                <TableCell> {this.props.t('CONVERSION_GOALS')} </TableCell>
                <TableCell> {this.props.t('ADVERTISER')} </TableCell>
                <TableCell> {this.props.t('EXPIRATION_DATE')} </TableCell>
                <TableCell> {this.props.t('ACTIONS')} </TableCell>
            </TableHead>
        )
    }

    renderTableRow(bid, index, { to, selected }) {
        return (
            <TableRow key={bid.id}>
                <TableCell> {bid.amount} </TableCell>
                <TableCell> {bid.requiredPoints} </TableCell>
                <TableCell> {bid.advertiser} </TableCell>
                <TableCell> {moment(bid.requiredExecTime).format('DD.MM.YYYY')} </TableCell>
                <TableCell> <Button label='ACCEPT' primary raised /> <Button label='REJECT' /> </TableCell>
            </TableRow >
        )
    }

    renderRows = (items) =>
        <Rows
            multiSelectable={false}
            selectable={false}
            side={this.props.side}
            item={items}
            rows={items}
            rowRenderer={this.renderTableRow.bind(this)}
            tableHeadRenderer={this.renderTableHead.bind(this)}
        />

    render() {
        let bidsIds = this.props.bidsIds
        let openBids = []
        let otherBids = []
        let allBids = []



        for (let i = 0; i < bidsIds.length; i++) {
            let bid = this.props.bids[bidsIds[i]]
            if (bid.state === BidState.Open) {
                openBids.push(bid)
            } else {
                otherBids.push(bid)
            }

            allBids.push(bid)
        }

        return (
            <div>
                <Tabs
                    theme={theme}
                    index={this.state.tabIndex}
                    onChange={this.handleTabChange.bind(this)}
                >
                    <Tab label='BIDS'>
                        <div>
                            <ItemsList items={openBids} listMode='rows' delete renderRows={this.renderRows} sortProperties={SORT_PROPERTIES} />
                        </div>
                    </Tab>
                    <Tab label='BIDS_HISTORY'>
                        <div>
                            <ItemsList items={otherBids} listMode='rows' delete renderRows={this.renderRows} sortProperties={SORT_PROPERTIES} />
                        </div>
                    </Tab>
                </Tabs>
            </div>
        )
    }
}

SlotBids.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    // items: PropTypes.array.isRequired,
    item: PropTypes.object.isRequired,
    slots: PropTypes.array.isRequired,
    spinner: PropTypes.bool
};

function mapStateToProps(state, props) {
    return {
        account: state.account,
        slots: state.items[ItemsTypes.AdSlot.id],
        // item: state.currentItem,
        spinner: state.spinners[ItemsTypes.AdUnit.name],
        bidsIds: state.bids.bidsByAdslot[props.item._id],
        bids: state.bids.bidsById
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SlotBids);
