import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import DatePicker from 'react-toolbox/lib/date_picker'
import { ItemsTypes } from 'constants/itemsTypes'
import NewItemHoc from './NewItemHocStep'
import theme from './theme.css'
import { Button } from 'react-toolbox/lib/button'
import Translate from 'components/translate/Translate'

class NewCampaignForm extends Component {

    render() {
        let item = this.props.item
        let from = item._meta.from ? new Date(item._meta.from) : null
        let to = item._meta.to ? new Date(item._meta.to) : null
        return (
            <div>
                <DatePicker
                    label={this.props.t('from', { isProp: true })}
                    minDate={new Date()}
                    onChange={this.props.handleChange.bind(this, 'from')}
                    value={from}
                    className={theme.datepicker}
                />
                <DatePicker
                    label={this.props.t('to', { isProp: true })}
                    minDate={new Date()}
                    onChange={this.props.handleChange.bind(this, 'to')}
                    value={to}
                    className={theme.datepicker}
                />
            </div>
        )
    }
}

NewCampaignForm.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    newItem: PropTypes.object.isRequired,
    title: PropTypes.string,
    items: PropTypes.array.isRequired
};

function mapStateToProps(state) {
    // console.log('mapStateToProps Campaigns', state)
    return {
        account: state.account,
        newItem: state.newItem[ItemsTypes.Campaign.id],
        items: state.items[ItemsTypes.Campaign.id],
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
)(Translate(ItemNewCampaignForm))
