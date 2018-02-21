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

const { ItemsTypes, AdTypes, AdSizes, AdSizesByValue } = ItemsConstants

class NewSlotForm extends Component {

    componentDidMount() {
        if (!this.props.item.adType) {
            this.props.validate('adType', {
                isValid: false,
                err: { msg: 'ERR_REQUIRED_FIELD' },
                dirty: false
            })
        }
        if (!this.props.item.size) {
            this.props.validate('size', {
                isValid: false,
                err: { msg: 'ERR_REQUIRED_FIELD' },
                dirty: false
            })
        }
        // if (!this.props.item.slotUrl) {
        //     this.props.validate('slotUrl', {
        //         isValid: false,
        //         err: { msg: 'ERR_REQUIRED_FIELD' },
        //         dirty: false
        //     })
        // }
    }

    validateAndUpdateDD = (dirty, propsName, value) => {
        let isValid = !!value
        let msg = 'ERR_REQUIRED_FIELD'

        if (propsName === 'size' &&
            (this.props.item.img.width != AdSizesByValue[value].width ||
                this.props.item.img.height != AdSizesByValue[value].height)) {
            //TODO:            
        }

        this.props.handleChange(propsName, value)
        this.props.validate(propsName, { isValid: isValid, err: { msg: msg }, dirty: dirty })
    }

    render() {
        let item = this.props.item
        let ad_url = item.ad_url
        let t = this.props.t
        let errSize = this.props.invalidFields['size']
        let errImg = this.props.invalidFields['img']

        return (
            <div>
                <div>
                    <Grid fluid className={theme.grid}>
                        <Row middle='md'>
                            <Col sm={12} lg={6}>
                                <Dropdown
                                    required
                                    onChange={this.validateAndUpdateDD.bind(this, true, 'adType')}
                                    source={AdTypes}
                                    value={item.adType + ''}
                                    label={t('adType', { isProp: true })}
                                />
                            </Col>
                            <Col sm={12} lg={6}>
                                <Dropdown
                                    required
                                    onChange={this.validateAndUpdateDD.bind(this, true, 'size')}
                                    source={AdSizes}
                                    value={item.size + ''}
                                    label={t('size', { isProp: true })}
                                />
                            </Col>
                        </Row>
                        <Row middle='md'>
                            <Col sm={12}>
                                <Input
                                    required
                                    type='text'
                                    label={t('slotUrl', { isProp: true })}
                                    value={item.slotUrl}
                                    onChange={this.props.handleChange.bind(this, 'slotUrl')}
                                    maxLength={1024} >
                                    {/* {this.props.descriptionHelperTxt ?
                                    <div>
                                        {this.props.descriptionHelperTxt}
                                    </div> : null} */}
                                </Input>
                            </Col>
                            <Col sm={12}>
                                <Input
                                    required
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
