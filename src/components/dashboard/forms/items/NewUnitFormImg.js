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

const { ItemsTypes, AdSizesByValue } = ItemsConstants


class NewUnitFormImg extends Component {

    componentDidMount() {
        let bannerImg = this.props.item.img

        if (bannerImg.tempUrl) {
            let width = AdSizesByValue[this.props.item.size].width
            let height = AdSizesByValue[this.props.item.size].height
            let isValidBanner = (bannerImg.width === width) && (bannerImg.height === height)

            this.props.validate('img', {
                isValid: isValidBanner,
                err: { msg: 'ERR_IMG_SIZE_EXACT', args: [width, height, 'px'] },
                dirty: true
            })
        } else {
            this.props.validate('img', {
                isValid: false,
                err: { msg: 'ERR_REQUIRED_FIELD' },
                dirty: false
            })
        }
    }

    // TODO: make some HOC
    validateImg = (propsName, widthTarget, heightTarget, msg, exact, img) => {
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
        let errImg = this.props.invalidFields['img']
        return (
            <div>
                <Grid fluid className={theme.grid}>
                    <Row>

                        <Col sm={12}>
                            <ImgForm
                                label={t('UNIT_BANNER_IMG_LABEL')}
                                imgSrc={item.img.tempUrl || 'nourl'}
                                onChange={this.validateImg.bind(this, 'img', AdSizesByValue[item.size].width, AdSizesByValue[item.size].height, 'ERR_IMG_SIZE_EXACT', true)}
                                additionalInfo={t('UNIT_BANNER_IMG_INFO', { args: [AdSizesByValue[item.size].width, AdSizesByValue[item.size].height, 'px'] })}
                                errMsg={errImg ? errImg.errMsg : ''}
                            />
                        </Col>
                    </Row>
                </Grid>
            </div>
        )
    }
}

NewUnitFormImg.propTypes = {
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

const NewUnitFormImgForm = NewItemHoc(NewUnitFormImg)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(NewUnitFormImgForm))
