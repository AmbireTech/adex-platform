
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../../actions/itemActions'
import { ItemsTypes, AdTypes, Sizes } from './../../../constants/itemsTypes'
import Img from './../../common/img/Img'
import Dropdown from 'react-toolbox/lib/dropdown'

export class Unit extends Component {
    // let side = props.match.params.side;
    // let campaign = props.match.params.campaign;

    handleChangeAdType(item, value) {
        this.props.actions.updateItem(item, {adType: value})
    }

    handleChangeAdSize(item, value) {
        this.props.actions.updateItem(item, {size: value})
    }

    render() {
        let unit = this.props.match.params.unit;

        // let account = props.account
        let item = this.props.units[unit]

        if (!item) return (<h1>Unit '404'</h1>)

        return (
            <div>
                <h2>AdUnit</h2>
                <h2>Unite: {item._name} </h2>
                <div>
                    <Img width='100' height='100' src={item.img} alt={item.fullName} />
                </div>
                <div>
                    <Dropdown
                        onChange={this.handleChangeAdType.bind(this, item)}
                        source={AdTypes}
                        value={item.adType}
                    />
                </div>
                <div>
                    <Dropdown
                        onChange={this.handleChangeAdSize.bind(this, item)}
                        source={Sizes}
                        value={item.size}
                    />
                </div>
            </div>
        )
    }
}

Unit.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    units: PropTypes.array.isRequired,
};

function mapStateToProps(state) {
    // console.log('mapStateToProps Campaign', state)
    return {
        account: state.account,
        units: state.items[ItemsTypes.AdUnit.id]
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
)(Unit);
