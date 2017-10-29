
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from 'actions/itemActions'
import { ItemsTypes, AdTypes, Sizes, TargetsWeight, Locations, TargetWeightLabels, Genders } from 'constants/itemsTypes'
import Dropdown from 'react-toolbox/lib/dropdown'
import ItemHoc from './ItemHoc'
import { Grid, Row, Col } from 'react-flexbox-grid'
import Img from 'components/common/img/Img'
import Item from 'models/Item'
import Input from 'react-toolbox/lib/input'
import theme from './theme.css'
import Autocomplete from 'react-toolbox/lib/autocomplete'
import Slider from 'react-toolbox/lib/slider'
import classnames from 'classnames'
import AdUnit from 'models/AdUnit'
import { Table, TableHead, TableRow, TableCell } from 'react-toolbox/lib/table'
import { IconButton, Button } from 'react-toolbox/lib/button'
import ItemsList from './ItemsList'
import Rows from 'components/dashboard/collection/Rows'

const SORT_PROPERTIES = [
    { value: '_id', label: 'Id' },
    { value: '_name', label: 'Short Name' },
    { value: 'fullName', label: 'Full name' },
    /** traffic, etc. */
]

export class UnitSlots extends Component {
    renderTableHead() {
        return (
            <TableHead>
                <TableCell> Slot </TableCell>
                <TableCell> Traffic </TableCell>
                <TableCell>  </TableCell>
            </TableHead>
        )
    }

    renderTableRow(item, index, { to, selected }) {
        return (
            <TableRow key={item._id}>
                <TableCell> {item._name} </TableCell>
                <TableCell> {index * 1000} </TableCell>
                <TableCell>
                    <Button accent raised label='PLACE_BIT' onClick={() => { }} />
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
        let slots = this.props.slots.filter((slot) => {
            return slot._meta.adType === item._meta.adType && slot._meta.size === item._meta.size
        })

        return (
            <ItemsList items={slots} listMode='rows' delete renderRows={this.renderRows} sortProperties={SORT_PROPERTIES} />
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
    return {
        account: state.account,
        // items: state.items[ItemsTypes.AdUnit.id],
        slots: state.items[ItemsTypes.AdSlot.id],
        // item: state.currentItem,
        spinner: state.spinners[ItemsTypes.AdUnit.name]
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
)(UnitSlots);
