import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../../actions/itemActions'
import DatePicker from 'react-toolbox/lib/date_picker'
import { ItemsTypes } from './../../../constants/itemsTypes'
import NewItemHoc from './NewItemHoc'

class NewCampaignForm extends Component {

    render() {
        let item = this.props.newItem
        return (
            <div>
                <DatePicker
                    label='Start date'
                    minDate={new Date()}
                    onChange={this.props.handleChange.bind(this, 'from')}
                    value={item._meta.from}
                />
                <DatePicker
                    label='End date'
                    minDate={new Date()}
                    onChange={this.props.handleChange.bind(this, 'to')}
                    value={item._meta.to}
                />
            </div>

        )
    }
}

NewCampaignForm.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    btnLabel: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired
};

function mapStateToProps(state) {
    // console.log('mapStateToProps Campaigns', state)
    return {
        account: state.account,
        newItem: state.newItem[ItemsTypes.Campaign.id]
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

const ItemNewCampaignForm = NewItemHoc(NewCampaignForm)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ItemNewCampaignForm);
