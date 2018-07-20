import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import NewItemHoc from './NewItemHocStep'
import Dropdown from 'components/common/dropdown'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import { items as ItemsConstants } from 'adex-constants'
import NewItemFormTags from './NewItemFormTags'

const { ItemsTypes, AdTypes, AdSizes } = ItemsConstants

class NewSlotForm extends Component {

    constructor(props, context) {
        super(props, context)
        this.state = {
            // TODO: Common func for this and ad unit
            adSizesSrc: AdSizes.map((size) => {
                return { value: size.value, label: props.t(size.label, { args: size.labelArgs }) }
            })
        }
    }

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
        const isValid = !!value
        const msg = 'ERR_REQUIRED_FIELD'

        this.props.handleChange(propsName, value)
        this.props.validate(propsName, { isValid: isValid, err: { msg: msg }, dirty: dirty })
    }

    render() {
        const { t, item } = this.props

        return (
            <div>
                <div>
                    <Grid
                        container
                        spacing={16}
                    >
                        <Grid item sm={12} lg={6}>
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
                        <Grid item sm={12} lg={6}>
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
                        <NewItemFormTags 
                            meta={this.props.item._meta} 
                            t={this.props.t} 
                            handleChange={this.props.handleChange}
                            account={this.props.account}
                        />
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
    const persist = state.persist
    // const memory = state.memory
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
