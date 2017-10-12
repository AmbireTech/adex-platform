
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from 'actions/itemActions'
import { ItemsTypes, AdTypes, Sizes } from 'constants/itemsTypes'
import Dropdown from 'react-toolbox/lib/dropdown'
import ItemHoc from './ItemHoc'

export class Unit extends Component {
    render() {
        let item = this.props.item
        let meta = item._meta

        if (!item) return (<h1>Unit '404'</h1>)

        return (
            <div>
                <div>
                    <Dropdown
                        onChange={this.props.handleChange.bind(this, 'adType')}
                        source={AdTypes}
                        value={meta.adType}
                        label='adType'
                    />
                </div>
                <div>
                    <Dropdown
                        onChange={this.props.handleChange.bind(this, 'size')}
                        source={Sizes}
                        value={meta.size}
                        label='size'
                    />
                </div>
            </div>
        )
    }
}

Unit.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
    item: PropTypes.object.isRequired,
    spinner: PropTypes.bool
};

function mapStateToProps(state) {
    return {
        account: state.account,
        items: state.items[ItemsTypes.AdUnit.id],
        // item: state.currentItem,
        spinner: state.spinners[ItemsTypes.AdUnit.name]
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

const UnitItem = ItemHoc(Unit)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UnitItem);
