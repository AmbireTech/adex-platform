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
        * Now it forces to add invalid property for the required filed to prevent to go to the next step
        */
        if (!this.props.item._meta.fullName) {
            this.props.validate('fullName', {
                isValid: false,
                err: { msg: 'ERR_REQUIRED_FIELD' },
                dirty: false
            })
        }
    }

    validateName(name, dirty) {
        let msg = ''
        let errMsgArgs = []
        if (!name) {
            msg = 'ERR_REQUIRED_FIELD'
        } else if (name.length < 4) {
            msg = 'ERR_MIN_LENGTH'
            errMsgArgs.push(4)
        } else if (name.length > 128) {
            msg = 'ERR_MAX_LENGTH'
            errMsgArgs.push(128)
        }

        this.props.validate('fullName', { isValid: !msg, err: { msg: msg, args: errMsgArgs }, dirty: dirty })
    }

    render() {
        let item = this.props.item
        let t = this.props.t
        let errFullName = this.props.invalidFields['fullName']
        return (
            <div>
                <Input
                    type='text'
                    required
                    label={ItemTypesNames[item._type] + ' ' + this.props.t('name', { isProp: true })}
                    name='name'
                    value={item._meta.fullName}
                    onChange={this.props.handleChange.bind(this, 'fullName')}
                    onBlur={this.validateName.bind(this, item._meta.fullName, true)}
                    onFocus={this.validateName.bind(this, item._meta.fullName, false)}
                    error={errFullName && !!errFullName.dirty ?
                        <span> {errFullName.errMsg} </span> : null}
                    maxLength={128} >
                    {this.props.nameHelperTxt && errFullName.dirty ?
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
                    {this.props.descriptionHelperTxt ?
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
