import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import NewItemHoc from './NewItemHocStep'
import Dropdown from 'react-toolbox/lib/dropdown'
import Input from 'react-toolbox/lib/input'
import Translate from 'components/translate/Translate'
import { Grid, Row, Col } from 'react-flexbox-grid'
import theme from './../theme.css'
import { items as ItemsConstants } from 'adex-constants'
import { validUrl } from 'helpers/validators'

const { ItemsTypes, AdTypes, AdSizes } = ItemsConstants

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
    }

    validateAndUpdateDD = (dirty, propsName, value) => {
        let isValid = !!value
        let msg = 'ERR_REQUIRED_FIELD'

        this.props.handleChange(propsName, value)
        this.props.validate(propsName, { isValid: isValid, err: { msg: msg }, dirty: dirty })
    }

    render() {
        let item = this.props.item
        let t = this.props.t
        let errFallbackAdUrl = this.props.invalidFields['fallbackAdUrl']

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
                                    // required
                                    type='text'
                                    label={t('fallbackAdUrl', { isProp: true })}
                                    value={item.fallbackAdUrl}
                                    onChange={this.props.handleChange.bind(this, 'fallbackAdUrl')}
                                    maxLength={1024}
                                    onBlur={this.props.validate.bind(this, 'fallbackAdUrl', { isValid: !item.fallbackAdUrl || validUrl(item.fallbackAdUrl), err: { msg: 'ERR_INVALID_URL' }, dirty: true })}
                                    onFocus={this.props.validate.bind(this, 'fallbackAdUrl', { isValid: !item.fallbackAdUrl || validUrl(item.fallbackAdUrl), err: { msg: 'ERR_INVALID_URL' }, dirty: false })}
                                    error={errFallbackAdUrl && !!errFallbackAdUrl.dirty ? <span> {errFallbackAdUrl.errMsg} </span> : null}
                                >
                                    {!errFallbackAdUrl || !errFallbackAdUrl.dirty ?
                                        <div>
                                            {t('SLOT_FALLBACK_AD_URL_DESCRIPTION')}
                                        </div> : null}
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
