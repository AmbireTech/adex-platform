import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import NewItemHoc from './NewItemHocStep'
import Dropdown from 'components/common/dropdown'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import { validUrl } from 'helpers/validators'
import { items as ItemsConstants } from 'adex-constants'

const { ItemsTypes, AdTypes, AdSizes } = ItemsConstants

class NewUnitForm extends Component {

    constructor(props, context) {
        super(props, context)
        this.state = {
            adSizesSrc: AdSizes.map((size) => {
                return { value: size.value, label: props.t(size.label, { args: size.labelArgs }) }
            })
        }
    }

    componentDidMount() {
        this.props.validate('ad_url', {
            isValid: validUrl(this.props.item.ad_url),
            err: { msg: 'ERR_REQUIRED_FIELD' },
            dirty: false
        })

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
        let ad_url = item.ad_url
        let t = this.props.t
        let errUrl = this.props.invalidFields['ad_url']
        return (
            <div>
                <Grid
                    container
                    spacing={16}
                >
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            type='text'
                            required
                            label={t('ad_url', { isProp: true })}
                            value={ad_url}
                            onChange={(ev) => this.props.handleChange('ad_url', ev.target.value)}
                            maxLength={1024}
                            onBlur={() => this.props.validate('ad_url', { isValid: validUrl(ad_url), err: { msg: 'ERR_INVALID_URL' }, dirty: true })}
                            onFocus={() => this.props.validate('ad_url', { isValid: validUrl(ad_url), err: { msg: 'ERR_INVALID_URL' }, dirty: false })}
                            error={errUrl && !!errUrl.dirty}
                            helperText={errUrl && !!errUrl.dirty ? errUrl.errMsg : ''}
                        />
                    </Grid>
                    <Grid item sm={12} md={6}>
                        <Dropdown
                            fullWidth
                            required
                            onChange={this.validateAndUpdateDD.bind(this, true, 'adType')}
                            source={AdTypes}
                            value={item.adType + ''}
                            label={t('adType', { isProp: true })}
                            htmlId='ad-type-dd'
                            name='adType'
                        />
                    </Grid>
                    <Grid item sm={12} md={6}>
                        <Dropdown
                            fullWidth
                            required
                            onChange={this.validateAndUpdateDD.bind(this, true, 'size')}
                            source={this.state.adSizesSrc}
                            value={item.size + ''}
                            label={t('size', { isProp: true })}
                            htmlId='ad-size-dd'
                            name='size'
                        />
                    </Grid>
                </Grid>
            </div >
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
