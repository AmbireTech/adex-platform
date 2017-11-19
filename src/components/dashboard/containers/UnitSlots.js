
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
import NewItemWithDialog from 'components/dashboard/forms/NewItemWithDialog'
import BidForm from 'components/dashboard/forms/BidForm'
import Dialog from 'react-toolbox/lib/dialog'
import Translate from 'components/translate/Translate'

const SORT_PROPERTIES = [
    { value: '_id', label: 'Id' },
    { value: '_name', label: 'Short Name' },
    { value: 'fullName', label: 'Full name' },
    /** traffic, etc. */
]

export class UnitSlots extends Component {

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
                <TableCell> {this.props.t('PUBLISHER')} </TableCell>
                <TableCell> {this.props.t('SLOT')} </TableCell>
                <TableCell> {this.props.t('ACTIONS')} </TableCell>
            </TableHead>
        )
    }

    renderTableRow(item, index, { to, selected }) {
        return (
            <TableRow key={item._id}>
                <TableCell> {item._owner} </TableCell>
                <TableCell> {item._name} </TableCell>
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

                    <BidForm slot={this.state.activeSlot} />

                </Dialog>
            </span>

        )
    }

    bid = (slot, active) => {
        this.setState({ activeSlot: slot, bidding: active })
    }

    render() {
        let item = this.props.item
        let meta = item._meta
        let t = this.props.t
        let slots = this.props.slots.filter((slot) => {
            return slot._meta.adType === item._meta.adType && slot._meta.size === item._meta.size
        })

        return (
            <div>
                <ItemsList items={slots} listMode='rows' delete renderRows={this.renderRows.bind(this)} sortProperties={SORT_PROPERTIES} />
                {this.renderDialog()}
            </div>
        )
    }
}

UnitSlots.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    // items: PropTypes.array.isRequired,
    item: PropTypes.object.isRequired,
    slots: PropTypes.array.isRequired,
    spinner: PropTypes.bool
};

function mapStateToProps(state) {
    let persist = state.persist
    let memory = state.memory
    return {
        account: persist.account,
        slots: persist.items[ItemsTypes.AdSlot.id],
        spinner: memory.spinners[ItemsTypes.AdUnit.name]
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

// const UnitItem = ItemHoc(UnitSlots)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(UnitSlots));
