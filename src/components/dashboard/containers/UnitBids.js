
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import { Table, TableHead, TableRow, TableCell } from 'react-toolbox/lib/table'
import { IconButton, Button } from 'react-toolbox/lib/button'
import ItemsList from './ItemsList'
import Rows from 'components/dashboard/collection/Rows'
import Translate from 'components/translate/Translate'
import { getUnitBids } from 'services/adex-node/actions'
import { Item } from 'adex-models'
import { items as ItemsConstants } from 'adex-constants'
import { CancelBid } from 'components/dashboard/forms/web3/transactions'

const { ItemsTypes } = ItemsConstants

const SORT_PROPERTIES = [
    { value: '_target', label: 'Target' },
    { value: '_amount', label: 'Amount' },
    { value: '_timeout', label: 'Timeout' },
    /** traffic, etc. */
]

// TODO: Higher level component that uses Item to pass instance of the Item in order to use its props through getters instead of plain object props
// TODO: use plain object only for the store

export class UnitBids extends Component {

    constructor(props) {
        super(props)
        this.state = {
            bidding: false,
            activeSlot: {}
        }
    }

    renderTableHead() {
        return (
            <TableHead>
                <TableCell> {this.props.t('TARGET')} </TableCell>
                <TableCell> {this.props.t('AMOUNT')} </TableCell>
                <TableCell> {this.props.t('STATE')} </TableCell>
                <TableCell> {this.props.t('TIMEOUT')} </TableCell>
                <TableCell> {this.props.t('ACTIONS')} </TableCell>
            </TableHead>
        )
    }

    renderTableRow(bid, index, { to, selected }) {
        return (
            <TableRow key={bid._id}>
                <TableCell> {bid._target} </TableCell>
                <TableCell> {bid._amount} </TableCell>
                <TableCell> {bid._state} </TableCell>
                <TableCell> {bid._timeout} </TableCell>
                <TableCell>
                    {bid._state == 0 ?
                        <CancelBid
                            icon='cancel'
                            adUnitId={bid._adUnitId}
                            bidId={bid._id}
                            placedBid={bid}
                            acc={this.props.account}
                            raised
                            accent
                            onSave={this.onSave}
                        /> : null
                    }
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

    render() {
        let item = this.props.item
        let t = this.props.t
        let bids = this.props.bids || []

        return (
            <div>
                <ItemsList items={bids} listMode='rows' delete renderRows={this.renderRows.bind(this)} sortProperties={SORT_PROPERTIES} />
            </div>
        )
    }
}

UnitBids.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    item: PropTypes.object.isRequired,
    spinner: PropTypes.bool
}

function mapStateToProps(state) {
    let persist = state.persist
    let memory = state.memory
    return {
        account: persist.account,
        spinner: memory.spinners[ItemsTypes.AdUnit.name]
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
