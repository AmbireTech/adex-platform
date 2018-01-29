
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
import Translate from 'components/translate/Translate'
import { getUnitBids } from 'services/adex-node/actions'
import { Item } from 'adex-models'

const SORT_PROPERTIES = [
    { value: 'target', label: 'Target' },
    { value: 'amount', label: 'Amount' },
    { value: 'timeout', label: 'Timeout' },
    /** traffic, etc. */
]

// TODO: Higher level component that uses Item to pass instance of the Item in order to use its props through getters instead of plain object props
// TODO: use plain object only for the store

export class UnitBids extends Component {

    constructor(props) {
        super(props)
        this.state = {
            bidding: false,
            activeSlot: {},
            bids: []
        }
    }

    componentWillMount() {
        getUnitBids({ userAddr: this.props.account._addr, adUnit: this.props.item._id })
            .then((bids) => {
                console.log('unit bids', bids)
                this.setState({ bids: bids })
            })
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

    renderTableRow(item, index, { to, selected }) {
        return (
            <TableRow key={item._id}>
                <TableCell> {item.target} </TableCell>
                <TableCell> {item.amount} </TableCell>
                <TableCell> {item.state} </TableCell>
                <TableCell> {item.timeout} </TableCell>
                <TableCell>
                    <Button accent raised label={this.props.t('CANCEL_BID')} />
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
        let meta = item._meta
        let t = this.props.t
        let bids = this.state.bids || []

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
