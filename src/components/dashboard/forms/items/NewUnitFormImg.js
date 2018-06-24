import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import NewItemHoc from './NewItemHocStep'
import Translate from 'components/translate/Translate'
import ImgForm from 'components/dashboard/forms/ImgForm'
import Grid from '@material-ui/core/Grid'
import { items as ItemsConstants } from 'adex-constants'
import ValidImageHoc from 'components/dashboard/forms/ValidImageHoc'

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

    render() {
        const { item, t } = this.props
        const errImg = this.props.invalidFields['img']
        return (
            <div>
                <Grid
                    container
                >
                    <Grid item sm={12}>
                        <ImgForm
                            label={t('UNIT_BANNER_IMG_LABEL')}
                            imgSrc={item.img.tempUrl || ''}
                            onChange={this.props.validateImg.bind(this,
                                { propsName: 'img', widthTarget: AdSizesByValue[item.size].width, heightTarget: AdSizesByValue[item.size].height, msg: 'ERR_IMG_SIZE_EXACT', exact: true, required: true })}
                            additionalInfo={t('UNIT_BANNER_IMG_INFO', { args: [AdSizesByValue[item.size].width, AdSizesByValue[item.size].height, 'px'] })}
                            errMsg={errImg ? errImg.errMsg : ''}
                            size={{ width: AdSizesByValue[item.size].width, height: AdSizesByValue[item.size].height }}
                        />
                    </Grid>
                </Grid>
            </div >
        )
    }
}

NewUnitFormImg.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    title: PropTypes.string
}

function mapStateToProps(state) {
    const persist = state.persist
    // const memory = state.memory
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

const NewUnitFormImgForm = NewItemHoc(ValidImageHoc(NewUnitFormImg))
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(NewUnitFormImgForm))
