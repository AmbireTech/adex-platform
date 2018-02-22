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
import ValidImageHoc  from 'components/dashboard/forms/ValidImageHoc'

const { ItemsTypes, AdSizesByValue } = ItemsConstants
const AVATAR_MAX_WIDTH = 600
const AVATAR_MAX_HEIGHT = 400

class NewSlotFormImgs extends Component {

    componentDidMount() {
        let avatarImg = this.props.item.img
        let fallbackImg = this.props.item.fallbackAdImg

        if (avatarImg.tempUrl) {
            let isValidAvatar = (avatarImg.width <= AVATAR_MAX_WIDTH) || (avatarImg.height <= AVATAR_MAX_HEIGHT)
            this.props.validate('img', {
                isValid: isValidAvatar,
                err: { msg: 'ERR_IMG_SIZE_MAX', args: [AVATAR_MAX_WIDTH, AVATAR_MAX_HEIGHT, 'px'] },
                dirty: true
            })
        }

        if (fallbackImg.tempUrl) {
            let width = AdSizesByValue[this.props.item.size].width
            let height = AdSizesByValue[this.props.item.size].height
            let isValidFallback = (fallbackImg.width === width) && (fallbackImg.height === height)

            this.props.validate('fallbackAdImg', {
                isValid: isValidFallback,
                err: { msg: 'ERR_IMG_SIZE_EXACT', args: [width, height, 'px'] },
                dirty: true
            })
        }
    }

    render() {
        let item = this.props.item
        let t = this.props.t
        let errImg = this.props.invalidFields['img']
        let errFallbackAdImg = this.props.invalidFields['fallbackAdImg']
        return (
            <div>
                <div>
                    <Grid fluid className={theme.grid}>
                        <Row>
                            <Col sm={12}>
                                <ImgForm
                                    label={t('SLOT_AVATAR_IMG_LABEL')}
                                    imgSrc={item.img.tempUrl || ''}
                                    onChange={this.props.validateImg.bind(this, 'img', AVATAR_MAX_WIDTH, AVATAR_MAX_HEIGHT, 'ERR_IMG_SIZE_MAX', false, false)}
                                    additionalInfo={t('SLOT_AVATAR_IMG_INFO')}
                                    errMsg={errImg ? errImg.errMsg : ''}
                                />
                            </Col>
                            <Col sm={12}>
                                <ImgForm
                                    label={t('SLOT_FALLBACK_IMG_LABEL')}
                                    imgSrc={item.fallbackAdImg.tempUrl || ''}
                                    onChange={this.props.validateImg.bind(this, 'fallbackAdImg', AdSizesByValue[item.size].width, AdSizesByValue[item.size].height, 'ERR_IMG_SIZE_EXACT', true, false)}
                                    additionalInfo={t('SLOT_FALLBACK_IMG_INFO', { args: [AdSizesByValue[item.size].width, AdSizesByValue[item.size].height, 'px'] })}
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

const NewSlotFormImgsForm = NewItemHoc(ValidImageHoc(NewSlotFormImgs))
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(NewSlotFormImgsForm))
