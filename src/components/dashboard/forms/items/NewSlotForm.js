import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import NewItemHoc from './NewItemHocStep'
import Dropdown from 'react-toolbox/lib/dropdown'
import Input from 'react-toolbox/lib/input'
import Translate from 'components/translate/Translate'
import ImgForm from './../ImgForm'
import { Grid, Row, Col } from 'react-flexbox-grid'
import theme from './../theme.css'
// import { validUrl } from 'helpers/validators'
import { items as ItemsConstants } from 'adex-constants'

const { ItemsTypes, AdTypes, AdSizes, ItemTypesNames } = ItemsConstants

class NewSlotForm extends Component {

    componentDidMount() {
        if (!this.props.item.img) {
            this.props.validate('img', {
                isValid: false,
                err: { msg: 'ERR_REQUIRED_FIELD' },
                dirty: false
            })
        }
    }

    validateImg = (propsName, img ) =>{
        let image = new Image()
        image.src = img.tempUrl
        let that = this

        image.onload = function() {
            //TODO:
            that.props.validate(propsName, { isValid: true, err: { msg: 'msg', args: ['errMsgArgs'] }, dirty: false })

            that.props.handleChange(propsName, img)
        }        
    }

    render() {
        let item = this.props.item
        let ad_url = item.ad_url
        let t = this.props.t
        return (
            <div>
                <div>
                    <Grid fluid className={theme.grid}>
                        <Row middle='md'>
                            <Col sm={12} lg={6}>
                                <Dropdown
                                    onChange={this.props.handleChange.bind(this, 'adType')}
                                    source={AdTypes}
                                    value={item.adType + ''}
                                    label={t('adType', { isProp: true })}
                                />
                            </Col>
                            <Col sm={12} lg={6}>
                                <Dropdown
                                    onChange={this.props.handleChange.bind(this, 'size')}
                                    source={AdSizes}
                                    value={item.size + ''}
                                    label={t('size', { isProp: true })}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col sm={12}>
                                <Input
                                    type='text'
                                    required
                                    label={ItemTypesNames[item._type] + ' ' + this.props.t('fallbackImageUrl', { isProp: true })}
                                    name='fallbackImageUrl'
                                    value={item.fallbackImageUrl}
                                    onChange={this.props.handleChange.bind(this, 'fallbackImageUrl')}
                                    // onBlur={this.validateName.bind(this, item.fullName, true)}
                                    // onFocus={this.validateName.bind(this, item.fullName, false)}
                                    // error={errFullName && !!errFullName.dirty ?
                                    //     <span> {errFullName.errMsg} </span> : null}
                                    maxLength={128} >
                                    {/* {this.props.nameHelperTxt && errFullName.dirty ?
                                    <div>
                                        {this.props.nameHelperTxt}
                                    </div> : null} */}
                                </Input>
                            </Col>
                            <Col sm={12}>
                                <Input
                                    type='text'
                                    label={t('fallbackAdUrl', { isProp: true })}
                                    value={item.fallbackAdUrl}
                                    onChange={this.props.handleChange.bind(this, 'fallbackAdUrl')}
                                    maxLength={1024} >
                                    {/* {this.props.descriptionHelperTxt ?
                                    <div>
                                        {this.props.descriptionHelperTxt}
                                    </div> : null} */}
                                </Input>
                            </Col>
                        </Row>
                    </Grid>
                </div>

                {<ImgForm label={t(this.props.imgLabel || 'img', { isProp: !this.props.imgLabel })} imgSrc={item.img.tempUrl || 'nourl'} onChange={this.validateImg.bind(this, 'img')} />}
            </div>
        )
    }
}

NewSlotForm.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    title: PropTypes.string
}

function mapStateToProps(state) {
    let persist = state.persist
    // let memory = state.memory
    return {
        account: persist.account,
        itemType: ItemsTypes.AdSlot.id
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

const ItemNewSlotForm = NewItemHoc(NewSlotForm)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(ItemNewSlotForm))
