import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import NewItemHoc from './NewItemHocStep'
import Input from 'react-toolbox/lib/input'
import Translate from 'components/translate/Translate'
import theme from './../theme.css'
import { Grid, Row, Col } from 'react-flexbox-grid'
import ImgForm from './../ImgForm'
import { items as ItemsConstants } from 'adex-constants'

const { ItemTypesNames } = ItemsConstants
const AVATAR_MAX_WIDTH = 600
const AVATAR_MAX_HEIGHT = 400

class NewItemForm extends Component {

    componentDidMount() {
        /* TODO: make it understandable
        * Now it forces to add invalid property for the required filed to prevent to go to the next step
        */
        if (!this.props.item.fullName) {
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

    validateImg = (propsName, widthTarget, heightTarget, msg, exact, required, img) => {
        if(!required && !img.tempUrl){
            this.props.validate(propsName, { isValid: true, err: { msg: msg, args: [] }, dirty: true })
            this.props.handleChange(propsName, img)
            return
        }

        let image = new Image()
        image.src = img.tempUrl
        let that = this

        image.onload = function () {
            let width = this.width
            let height = this.height

            let isValid = true
            let masgArgs = []

            if (exact && (widthTarget !== width || heightTarget !== height)) {
                isValid = false

            }
            if (!exact && (widthTarget < width || heightTarget < height)) {
                isValid = false
            }

            masgArgs = [widthTarget, heightTarget, 'px']

            that.props.validate(propsName, { isValid: isValid, err: { msg: msg, args: masgArgs }, dirty: true })
            img.width = width
            img.height = height
            that.props.handleChange(propsName, img)
        }
    }

    render() {
        let item = this.props.item
        let t = this.props.t
        let errFullName = this.props.invalidFields['fullName']
        let errImg = this.props.invalidFields['img']

        return (
            <div>
                <Grid fluid className={theme.grid}>
                    <Row>
                        <Col sm={12}>
                            <Input
                                type='text'
                                required
                                label={ItemTypesNames[item._type] + ' ' + this.props.t('name', { isProp: true })}
                                name='name'
                                value={item.fullName}
                                onChange={this.props.handleChange.bind(this, 'fullName')}
                                onBlur={this.validateName.bind(this, item.fullName, true)}
                                onFocus={this.validateName.bind(this, item.fullName, false)}
                                error={errFullName && !!errFullName.dirty ?
                                    <span> {errFullName.errMsg} </span> : null}
                                maxLength={128} >
                                {this.props.nameHelperTxt && errFullName && errFullName.dirty ?
                                    <div>
                                        {this.props.nameHelperTxt}
                                    </div> : null}
                            </Input>
                        </Col>
                        <Col sm={12}>
                            <Input
                                type='text'
                                multiline
                                rows={3}
                                label={t('description', { isProp: true })}
                                value={item._description}
                                onChange={this.props.handleChange.bind(this, 'description')}
                                maxLength={1024} >
                                {this.props.descriptionHelperTxt ?
                                    <div>
                                        {t(this.props.descriptionHelperTxt)}
                                    </div> : null}
                            </Input>
                        </Col>
                    </Row>
                    {this.props.noDefaultImg ?
                        null :
                        <Row>
                            <Col sm={12}>
                                <ImgForm
                                    label={t(this.props.imgLabel || 'img', { isProp: !this.props.imgLabel })}
                                    imgSrc={item.img.tempUrl || ''}
                                    onChange={this.validateImg.bind(this, 'img', AVATAR_MAX_WIDTH, AVATAR_MAX_HEIGHT, 'ERR_IMG_SIZE_MAX', false, false)}
                                    additionalInfo={t(this.props.imgAdditionalInfo)}
                                    errMsg={errImg ? errImg.errMsg : ''}
                                />
                            </Col>
                        </Row>
                    }
                </Grid>
            </div>
        )
    }
}

NewItemForm.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    newItem: PropTypes.object.isRequired,
    title: PropTypes.string,
    itemType: PropTypes.number.isRequired,
    imgLabel: PropTypes.string,
    descriptionHelperTxt: PropTypes.string,
    nameHelperTxt: PropTypes.string,
}

function mapStateToProps(state, props) {
    let persist = state.persist
    let memory = state.memory
    return {
        account: persist.account,
        newItem: memory.newItem[props.itemType]
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

const ItemNewItemForm = NewItemHoc(NewItemForm)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(ItemNewItemForm))
