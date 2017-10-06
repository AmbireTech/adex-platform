import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../../actions/itemActions'
// import Input from 'react-toolbox/lib/input'
// import DatePicker from 'react-toolbox/lib/date_picker'
import { ItemsTypes, AdTypes, Sizes } from './../../../constants/itemsTypes'
import NewItemHoc from './NewItemHocStep'
import Dropdown from 'react-toolbox/lib/dropdown'
import { Button } from 'react-toolbox/lib/button'

class NewUnitForm extends Component {

    render() {
        let item = this.props.item
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
                <br />
                <Button icon='save' label='Save' raised primary onClick={this.props.save} />
            </div>
        )
    }
}

NewUnitForm.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    newItem: PropTypes.object.isRequired,
    title: PropTypes.string,
    items: PropTypes.array.isRequired
}

function mapStateToProps(state) {
    // console.log('mapStateToProps Campaigns', state)
    return {
        account: state.account,
        newItem: state.newItem[ItemsTypes.AdUnit.id],
        items: state.items[ItemsTypes.AdUnit.id]
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

const ItemNewUnitForm = NewItemHoc(NewUnitForm)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ItemNewUnitForm)
