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
        if (!this.props.item.adType ) {
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
        if (!this.props.item.img.tempUrl) {
            this.props.validate('img', {
                isValid: false,
                err: { msg: 'ERR_REQUIRED_FIELD' },
                dirty: false
            })
        }
    }

    validateAndUpdateDD = (dirty, propsName, value) => {
        let isValid = !!value
        let msg = 'ERR_REQUIRED_FIELD'

        if(propsName === 'size' &&
            (this.props.img.width != AdSizesByValue[value].width ||
            this.props.img.height != AdSizesByValue[value].height)){
                //TODO:            
        }
  
        this.props.handleChange(propsName, value)
        this.props.validate(propsName, { isValid: isValid, err: { msg: msg}, dirty: dirty })        
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

            if(itemSize && 
                (AdSizesByValue[itemSize].width !== width ||
                AdSizesByValue[itemSize].height !== height)){
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
                    </Grid>
                </div>

                <ImgForm 
                    label={t(this.props.imgLabel || 'img', { isProp: !this.props.imgLabel })} 
                    imgSrc={item.img.tempUrl || 'nourl'} 
                    onChange={this.validateImg.bind(this, 'img')}
                    additionalInfo={errImg ? errImg.errMsg : ''}
                />
                
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
