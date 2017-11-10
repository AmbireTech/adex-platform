import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { ItemTypesNames } from 'constants/itemsTypes'
import NewItemHoc from './NewItemHocStep'
import Input from 'react-toolbox/lib/input'
import Translate from 'components/translate/Translate'
import ImgForm from './ImgForm'

class NewUnitForm extends Component {

    componentDidMount() {
        /* TODO: make it understandable
        * Now it forces to add invalid property for the required filed without setting prop error msg in order not to show the error yet
        */
        if (!this.props.item._meta.fullName) {
            this.props.validate('fullName', this.props.item._meta.fullName, () => false, '')
        }
    }

    validateName(name, reset) {
        let msg = ''
        if (!name) {
            msg = 'REQUIRED_FIELD'
        } else if (name.length < 4) {
            msg = 'MIN_LENGTH_4'
        } else if (name.length > 128) {
            msg = 'MAX_LENGTH_128'
        }

        this.props.validate('fullName', this.props.item._meta.ad_url, () => !msg, reset ? '' : msg)
    }

    render() {
        let item = this.props.item
        let t = this.props.t
        return (
            <div>
                <Input
                    type='text'
                    required
                    label={ItemTypesNames[item._type] + ' ' + this.props.t('name', { isProp: true })}
                    name='name'
                    value={item._meta.fullName}
                    onChange={this.props.handleChange.bind(this, 'fullName')}
                    onBlur={this.validateName.bind(this, item._meta.fullName, false)}
                    onFocus={this.validateName.bind(this, item._meta.fullName, true)}
                    error={this.props.invalidFields['fullName'] ? <span> {t(this.props.invalidFields['fullName'])} </span> : null}
                    maxLength={128} >
                    {this.props.nameHelperTxt && !this.props.invalidFields['fullName'] ?
                        <div>
                            {this.props.nameHelperTxt}
                        </div> : null}
                </Input>
                <Input
                    type='text'
                    multiline
                    rows={3}
                    label={t('description', { isProp: true })}
                    value={item._meta.description}
                    onChange={this.props.handleChange.bind(this, 'description')}
                    maxLength={1024} >
                    {this.props.descriptionHelperTxt && !this.props.invalidFields['description'] ?
                        <div>
                            {this.props.descriptionHelperTxt}
                        </div> : null}
                </Input>

                {this.props.noDefaultImg ?
                    null :
                    <ImgForm label={t(this.props.imgLabel || 'img', { isProp: !this.props.imgLabel })} imgSrc={item._meta.img.tempUrl} onChange={this.props.handleChange.bind(this, 'img')} />
                }
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
    itemType: PropTypes.number.isRequired,
    imgLabel: PropTypes.string,
    descriptionHelperTxt: PropTypes.string,
    nameHelperTxt: PropTypes.string,
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
