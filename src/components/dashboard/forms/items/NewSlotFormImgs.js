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

const { ItemsTypes, AdSizesByValue } = ItemsConstants

class NewSlotFormImgs extends Component {

    componentDidMount() {
        if (!this.props.item.img.tempUrl) {
            this.props.validate('img', {
                isValid: false,
                err: { msg: 'ERR_REQUIRED_FIELD' },
                dirty: false
            })
        }
        if (!this.props.item.fallbackAdImg.tempUrl) {
            this.props.validate('fallbackAdImg', {
                isValid: false,
                err: { msg: 'ERR_REQUIRED_FIELD' },
                dirty: false
            })
        }

        //TODO: validate sizes if not null
    }

    validateImg = (propsName, img) => {
        let image = new Image()
        image.src = img.tempUrl
        let that = this

        image.onload = function () {
            let width = this.width
            let height = this.height
            let itemSize = parseInt(that.props.item.size, 10)

            let isValid = true
            let msg = ''
            let masgArgs = []

            if (itemSize &&
                (AdSizesByValue[itemSize].width !== width ||
                    AdSizesByValue[itemSize].height !== height)) {
                isValid = false
                msg = 'ERR_IMG_SIZE_EXACT'
                masgArgs = [AdSizesByValue[itemSize].width, AdSizesByValue[itemSize].height, 'px']
            }

            that.props.validate(propsName, { isValid: isValid, err: { msg: msg, args: masgArgs }, dirty: true })
            img.width = width
            img.height = height
            that.props.handleChange(propsName, img)
        }
    }

    render() {
        let item = this.props.item
        let ad_url = item.ad_url
        let t = this.props.t
        let errSize = this.props.invalidFields['size'] || { errMsg: 'err' }
        let errImg = this.props.invalidFields['img']
        let errFallbackAdImg = this.props.invalidFields['fallbackAdImg']
        return (
            <div>
                <div>
                    <Grid fluid className={theme.grid}>
                        <Row>
                            <Col sm={12}>
                                <ImgForm
                                    label={t(this.props.imgLabel || 'img', { isProp: !this.props.imgLabel })}
                                    imgSrc={item.img.tempUrl || 'nourl'}
                                    onChange={this.validateImg.bind(this, 'img')}
                                    additionalInfo={t('IMG_INFO_SIZE')}
                                    errMsg={errImg ? errImg.errMsg : ''}
                                />
                            </Col>
                            <Col sm={12}>
                                <ImgForm
                                    label={t(this.props.imgLabel || 'fallbackAdImg', { isProp: !this.props.imgLabel })}
                                    imgSrc={item.fallbackAdImg.tempUrl || 'nourl'}
                                    onChange={this.validateImg.bind(this, 'fallbackAdImg')}
                                    additionalInfo={t('IMG_INFO_SIZE', { args: [AdSizesByValue[item.size].width, AdSizesByValue[item.size].height, 'px'] })}
                                    errMsg={errFallbackAdImg ? errFallbackAdImg.errMsg : ''}
                                />
                            </Col>
                        </Row>
                    </Grid>
                </div>
            </div>
        )
    }
}

NewSlotFormImgs.propTypes = {
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

const NewSlotFormImgsForm = NewItemHoc(NewSlotFormImgs)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(NewSlotFormImgsForm))
