import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from 'actions/itemActions'
import { ItemTypesNames } from 'constants/itemsTypes'
import NewItemHoc from './NewItemHocStep'
import Input from 'react-toolbox/lib/input'
import Translate from 'components/translate/Translate'
import ImgForm from './ImgForm'

class NewUnitForm extends Component {

    render() {
        let item = this.props.item
        return (
            <div>

                <Input
                    type='text'
                    label={ItemTypesNames[item._type] + ' ' + this.props.t('name', { isProp: true })}
                    name='name'
                    value={item._meta.fullName}
                    onChange={this.props.handleChange.bind(this, 'fullName')}
                    maxLength={128} />
                <Input
                    type='text'
                    multiline
                    rows={5}
                    label={this.props.t('description', { isProp: true })}
                    value={item._meta.description}
                    onChange={this.props.handleChange.bind(this, 'description')}
                    maxLength={1024} />
                <ImgForm onChange={this.props.handleChange.bind(this, 'img')} />
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
)(Translate(ItemNewUnitForm))
