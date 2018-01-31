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
import { validUrl } from 'helpers/validators'
import { items as ItemsConstants } from 'adex-constants'

const { ItemsTypes, AdTypes, AdSizes } = ItemsConstants


class NewUnitForm extends Component {

    componentDidMount() {
        /* TODO: make it understandable
        * Now it forces to add invalid property for the required filed to prevent to go to the next step
        */
        this.props.validate('ad_url', {
            isValid: validUrl(this.props.item.ad_url),
            err: { msg: 'ERR_REQUIRED_FIELD' },
            dirty: false
        })
    }

    render() {
        let item = this.props.item
        let ad_url = item.ad_url
        let t = this.props.t
        let errUrl = this.props.invalidFields['ad_url']
        return (
            <div>
                <Input
                    type='text'
                    required
                    label={t('ad_url', { isProp: true })}
                    value={ad_url}
                    onChange={this.props.handleChange.bind(this, 'ad_url')}
                    maxLength={1024}
                    onBlur={this.props.validate.bind(this, 'ad_url', { isValid: validUrl(ad_url), err: { msg: 'ERR_INVALID_URL' }, dirty: true })}
                    onFocus={this.props.validate.bind(this, 'ad_url', { isValid: validUrl(ad_url), err: { msg: 'ERR_INVALID_URL' }, dirty: false })}
                    error={errUrl && !!errUrl.dirty ? <span> {errUrl.errMsg} </span> : null}
                />
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
                    </Grid>
                </div>

                <ImgForm label={t(this.props.imgLabel || 'img', { isProp: !this.props.imgLabel })} imgSrc={item.img.tempUrl || 'nourl'} onChange={this.props.handleChange.bind(this, 'img')} />
            </div>
        )
    }
}

NewUnitForm.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    title: PropTypes.string
}

function mapStateToProps(state) {
    let persist = state.persist
    // let memory = state.memory
    return {
        account: persist.account,
        itemType: ItemsTypes.AdUnit.id
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

const ItemNewUnitForm = NewItemHoc(NewUnitForm)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(ItemNewUnitForm))
