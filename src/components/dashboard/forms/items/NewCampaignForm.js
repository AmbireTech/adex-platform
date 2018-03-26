import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import DatePicker from 'react-toolbox/lib/date_picker'
import NewItemHoc from './NewItemHocStep'
import theme from './../theme.css'
import Translate from 'components/translate/Translate'
import { items as ItemsConstants } from 'adex-constants'

const { ItemsTypes } = ItemsConstants

class NewCampaignForm extends Component {

    render() {
        let item = this.props.item
        let from = item.from ? new Date(item.from) : null
        let to = item.to ? new Date(item.to) : null
        let now = new Date()

        return (
            <div>
                <DatePicker
                    label={this.props.t('from', { isProp: true })}
                    minDate={now}
                    maxDate={to}
                    onChange={this.props.handleChange.bind(this, 'from')}
                    value={from}
                    className={theme.datepicker}
                />
                <DatePicker
                    label={this.props.t('to', { isProp: true })}
                    minDate={from || now}
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
    title: PropTypes.string
};

function mapStateToProps(state) {
    let persist = state.persist
    let memory = state.memory
    return {
        account: persist.account,
        newItem: memory.newItem[ItemsTypes.Campaign.id]
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
