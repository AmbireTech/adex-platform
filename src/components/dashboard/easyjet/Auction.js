import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import ItemsList from 'components/dashboard/containers/ItemsList'
import { TableHead, TableRow, TableCell } from 'react-toolbox/lib/table'
import Rows from 'components/dashboard/collection/Rows'
import theme from './theme.css'
import Translate from 'components/translate/Translate'
import { IconButton, Button } from 'react-toolbox/lib/button'
import Dialog from 'react-toolbox/lib/dialog'

const VIEW_MODE = 'campaignRowsView'
const VIEW_MODE_UNITS = 'campaignAdUNitsRowsView'

const SORT_PROPERTIES = [
    { value: 'id', label: 'Id' },
    { value: 'bidder', label: 'Bidder Name' },
    { value: 'bidPerSlot', label: 'Bid per slot' }
]

// TEMP: for fast test
let BIDS = [
    {
        id: 1,
        bidder: 'eToro',
        slotsAmaount: 2000000,

        bidPerSlot: 0.05
    }, {
        id: 2,
        bidder: 'eToro-2',
        slotsAmaount: 200000,
        bidPerSlot: 0.08
    }, {
        id: 3,
        bidder: 'eToro-3',
        slotsAmaount: 500000,
        bidPerSlot: 0.15
    }, {
        id: 4,
        bidder: 'eToro-4',
        slotsAmaount: 1000000,
        bidPerSlot: 0.25
    }
]

export class Auction extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            bidding: false,
            activeSlot: {}
        }
    }

    renderTableHead() {
        return (
            <TableHead>
                <TableCell> {this.props.t('BIDDER')} </TableCell>
                <TableCell> {this.props.t('SLOTS')} </TableCell>
                <TableCell> {this.props.t('BID_PER_SLOT')} </TableCell>
                <TableCell> {this.props.t('BID_TOTAL_AMOUNT')} </TableCell>
                <TableCell> {this.props.t('ACTIONS')} </TableCell>
            </TableHead>
        )
    }

    renderTableRow(item, index, { to, selected }) {
        return (
            <TableRow key={item.id}>
                <TableCell> {item.bidder} </TableCell>
                <TableCell> {item.slotsAmaount} </TableCell>
                <TableCell> {item.bidPerSlot} </TableCell>
                <TableCell> {item.bidPerSlot} </TableCell>
                <TableCell>
                    <Button accent raised label={this.props.t('PLACE_BID')} onClick={this.bid.bind(this, item, !this.state.bidding)} />
                </TableCell>
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

    renderDialog = () => {
        return (
            <span>
                <Dialog
                    theme={theme}
                    active={this.state.bidding}
                    onEscKeyDown={this.bid.bind(this, {}, !this.state.bidding)}
                    onOverlayClick={this.bid.bind(this, {}, !this.state.bidding)}
                    title={this.props.t('PLACE_BID_FOR', { args: [this.state.activeSlot._name] })}
                    type={this.props.type || 'normal'}
                >
                    <IconButton
                        icon='close'
                        onClick={this.bid.bind(this, {}, !this.state.bidding)}
                        primary
                        style={{ position: 'absolute', top: 20, right: 20 }}
                    />

                    {/* <BidForm slot={this.state.activeSlot} /> */}

                </Dialog>
            </span>
        )
    }

    bid = (slot, active) => {
        this.setState({ activeSlot: slot, bidding: active })
    }

    render() {
        return (
            <div>
                Ink auction
                <ItemsList items={BIDS} listMode='rows' delete renderRows={this.renderRows.bind(this)} sortProperties={SORT_PROPERTIES} />
                <this.renderDialog />
            </div>
        )
    }
}

Auction.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    rowsView: PropTypes.bool.isRequired
}

function mapStateToProps(state) {
    // console.log('mapStateToProps ChannelItem', state)
    return {
        account: state.account,
        rowsView: !!state.ui[VIEW_MODE]
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
)(Translate(Auction))
