import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from 'actions/itemActions'
// import Input from 'react-toolbox/lib/input'
// import DatePicker from 'react-toolbox/lib/date_picker'
import { ItemsTypes, AdTypes, Sizes, ItemTypesNames } from 'constants/itemsTypes'
import NewItemHoc from './NewItemHocStep'
import Dropdown from 'react-toolbox/lib/dropdown'
import Input from 'react-toolbox/lib/input'

class NewUnitForm extends Component {

    render() {
        let item = this.props.item
        return (
            <div>
                <Input type='text' label={ItemTypesNames[item._type] + ' Name'} name='name' value={item._meta.fullName} onChange={this.props.handleChange.bind(this, 'fullName')} maxLength={128} />
                <Input type='text' label='Image url' name='img' value={item._meta.img} onChange={this.props.handleChange.bind(this, 'img')} maxLength={1024} />
                <Input type='text' multiline rows={5} label='Description' name='desctiption' value={item._meta.description} onChange={this.props.handleChange.bind(this, 'description')} maxLength={1024} />
            </div>
        )
    }
}

NewUnitForm.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    newItem: PropTypes.object.isRequired,
    title: PropTypes.string,
    items: PropTypes.array.isRequired,
    itemType: PropTypes.number.isRequired
}

function mapStateToProps(state, props) {
    // console.log('mapStateToProps Campaigns', state)
    return {
        account: state.account,
        newItem: state.newItem[props.itemType],
        items: state.items[props.itemType]
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
