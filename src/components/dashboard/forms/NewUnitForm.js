import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../../actions/itemActions'
// import Input from 'react-toolbox/lib/input'
// import DatePicker from 'react-toolbox/lib/date_picker'
import { ItemsTypes, AdTypes, Sizes } from './../../../constants/itemsTypes'
import NewItemHoc from './NewItem'
import Dropdown from 'react-toolbox/lib/dropdown'

class NewUnitForm extends Component {

    render() {
        let item = this.props.newItem
        return (
            <div>
                <Dropdown
                    onChange={this.props.handleChange.bind(this, 'adType')}
                    source={AdTypes}
                    value={item._meta.adType}
                    label="adType"
                />
                <Dropdown
                    onChange={this.props.handleChange.bind(this, 'size')}
                    source={Sizes}
                    value={item._meta.size}
                    label="size"
                />
            </div>

        )
    }
}

NewUnitForm.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    newItem: PropTypes.object.isRequired,
    title: PropTypes.string
}

function mapStateToProps(state) {
    // console.log('mapStateToProps Campaigns', state)
    return {
        account: state.account,
        newItem: state.newItem[ItemsTypes.AdUnit.id]
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

const ItemNewUnitForm = NewItemHoc(NewUnitForm)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ItemNewUnitForm);
