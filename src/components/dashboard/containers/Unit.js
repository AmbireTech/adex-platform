
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../../actions/itemActions'
import { ItemsTypes, AdTypes, Sizes } from './../../../constants/itemsTypes'
import Img from './../../common/img/Img'
import Dropdown from 'react-toolbox/lib/dropdown'
import { Button } from 'react-toolbox/lib/button'
import ItemHoc from './ItemHoc'

export class Unit extends Component {

    componentWillReceiveProps(nextProps){
        console.log('nextProps', nextProps)

    }
    handleChangeAdType(item, value) {
        this.props.actions.updateCurrentItem(item, { adType: value })
    }

    handleChangeAdSize(item, value) {
        this.props.actions.updateCurrentItem(item, { size: value })
    }

    render() {
        let item = this.props.item

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
                <Button icon='bookmark' label='Save' onClick={this.props.save} raised primary />
            </div>
        )
    }
}

Unit.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
    item: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    // console.log('mapStateToProps Campaign', state)
    return {
        account: state.account,
        items: state.items[ItemsTypes.AdUnit.id],
        item: state.currentItem,
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
