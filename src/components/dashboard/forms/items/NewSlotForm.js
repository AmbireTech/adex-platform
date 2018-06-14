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
        let isValid = !!value
        let msg = 'ERR_REQUIRED_FIELD'

        this.props.handleChange(propsName, value)
        this.props.validate(propsName, { isValid: isValid, err: { msg: msg }, dirty: dirty })
    }

    render() {
        let item = this.props.item
        let t = this.props.t

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
                                    htmlId='ad-type-dd'
                                    name='adType'
                                />
                            </Col>
                            <Col sm={12} lg={6}>
                                <Dropdown
                                    required
                                    onChange={this.validateAndUpdateDD.bind(this, true, 'size')}
                                    source={this.state.adSizesSrc}
                                    value={item.size + ''}
                                    label={t('size', { isProp: true })}
                                    htmlId='ad-size-dd'
                                    name='size'
                                />
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
