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
import NewItemStep from './NewItemStep'
import Input from 'react-toolbox/lib/input'
import Base from './../../../models/Base'


class NewUnitFormSteps extends Component {

    handleChange = (name, value) => {
        console.log('handleChange', name, value)
        let newItem = Base.updateMeta(this.props.newItem, { [name]: value })
        console.log('newItem', newItem)     
        
        this.props.actions.updateNewItem(newItem, newItem._meta)
        // this.setState({ item: newItem })
    }

    render() {
        let item = this.props.newItem || {}
        item._meta = item._meta || {}

        return (
            <div>
                 <Input type='text' label='Name' name='name' value={item._meta.fullName} onChange={this.handleChange.bind(this, 'fullName')} maxLength={128} />
                <Dropdown
                    onChange={this.handleChange.bind(this, 'adType')}
                    source={AdTypes}
                    value={item._meta.adType}
                    label="adType"
                />
                <Dropdown
                    onChange={this.handleChange.bind(this, 'size')}
                    source={Sizes}
                    value={item._meta.size}
                    label="size"
                />
            </div>
        )
    }

    // render() {
    //     return null
    // }

    // render() {
    //     let item = this.props.item
    //     return (
    //         <div>
    //             <Dropdown
    //                 onChange={this.props.handleChange.bind(this, 'adType')}
    //                 source={AdTypes}
    //                 value={item._meta.adType}
    //                 label="adType"
    //             />
    //             <Dropdown
    //                 onChange={this.props.handleChange.bind(this, 'size')}
    //                 source={Sizes}
    //                 value={item._meta.size}
    //                 label="size"
    //             />
    //         </div>
    //     )
    // }
}

NewUnitFormSteps.propTypes = {
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
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

// const ItemNewUnitForm = NewItemHoc(NewUnitFormSteps)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NewUnitFormSteps);
