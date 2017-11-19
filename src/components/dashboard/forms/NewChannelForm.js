import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { ItemsTypes } from 'constants/itemsTypes'
import NewItemHoc from './NewItemHocStep'
import theme from './theme.css'
import { Button } from 'react-toolbox/lib/button'
import Translate from 'components/translate/Translate'

class NewChannelForm extends Component {

    render() {
        let item = this.props.item
        return (
            <div>
            </div>
        )
    }
}

NewChannelForm.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    newItem: PropTypes.object.isRequired,
    title: PropTypes.string,
    items: PropTypes.array.isRequired
};

function mapStateToProps(state) {
    state = state.storage
    return {
        account: state.account,
        newItem: state.newItem[ItemsTypes.Channel.id],
        items: state.items[ItemsTypes.Channel.id],
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

const ItemNewChannelForm = NewItemHoc(NewChannelForm)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(ItemNewChannelForm))
