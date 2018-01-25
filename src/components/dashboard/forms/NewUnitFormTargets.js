import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import NewItemHoc from './NewItemHocStep'
import Translate from 'components/translate/Translate'
import { ItemsTypes, Locations, TargetWeightLabels, Genders, TARGET_MIN_AGE, TARGET_MAX_AGE } from 'constants/itemsTypes'
import theme from './theme.css'
import AdUnit from 'models/AdUnit'
import { Grid, Row, Col } from 'react-flexbox-grid'
import Autocomplete from 'react-toolbox/lib/autocomplete'
import classnames from 'classnames'
import Slider from 'react-toolbox/lib/slider'

const autocompleteLocations = () => {
    let locs = {}
    Locations.map((loc) => {
        locs[loc.value] = loc.label
    })

    return locs
}

const AcLocations = autocompleteLocations()

const autocompleteGenders = () => {
    let genders = {}
    Genders.map((gen) => {
        genders[gen.value] = gen.label
    })

    return genders
}

const AcGenders = autocompleteGenders()

const ages = (() => {
    let ages = []
    for (var index = TARGET_MIN_AGE; index <= TARGET_MAX_AGE; index++) {
        ages.push(index + '')
    }

    return ages
})()

class NewUnitFormTargets extends Component {

    handleTargetChange = (target, valueKey, newValue) => {
        let newWeight
        if (valueKey === 'updateWeight') {
            newWeight = newValue
            newValue = target.value
        }

        else if (valueKey) {
            let tempValue = { ...target.value }
            if (valueKey === 'from' || valueKey === 'to') {
                newValue = newValue | 0
            }

            tempValue[valueKey] = newValue
            newValue = tempValue
        }

        let newTargets = AdUnit.updateTargets(this.props.item._meta.targets || [], target, newValue, newWeight)
        this.props.handleChange('targets', newTargets)
    }

    renderLocationTarget = (target) => {
        return (
            <Autocomplete
                direction="auto"
                multiple={true}
                onChange={this.handleTargetChange.bind(this, target, null)}
                label={this.props.t('TARGET_LOCATION')}
                source={AcLocations}
                value={target.value}
                suggestionMatch='anywhere'
                showSuggestionsWhenValueIsSet={true}
                allowCreate={false}
            />
        )
    }

    renderGendersTarget = (target) => {
        return (
            <Autocomplete
                direction="auto"
                multiple={true}
                onChange={this.handleTargetChange.bind(this, target, null)}
                label={this.props.t('TARGET_GENDERS')}
                source={AcGenders}
                value={target.value}
                suggestionMatch='anywhere'
                showSuggestionsWhenValueIsSet={true}
                allowCreate={false}
            />
        )
    }

    renderAgeTarget = (target) => {
        let value = target.value || {}
        return (
            <div>
                <Grid fluid className={theme.agesGrid}>
                    <Row>
                        <Col lg={6}>

                            <Autocomplete
                                direction="auto"
                                multiple={false}
                                onChange={this.handleTargetChange.bind(this, target, 'from')}
                                label={this.props.t('TARGET_AGE_FROM')}
                                source={ages.slice(0, (value.to | 0) + 1)}
                                value={value.from + ''}
                                suggestionMatch='anywhere'
                                showSuggestionsWhenValueIsSet={true}
                                allowCreate={false}
                            />
                        </Col>
                        <Col lg={6}>

                            <Autocomplete
                                direction="auto"
                                multiple={false}
                                onChange={this.handleTargetChange.bind(this, target, 'to')}
                                label={this.props.t('TARGET_AGE_TO')}
                                source={ages.slice(value.from | 0)}
                                value={value.to + ''}
                                suggestionMatch='anywhere'
                                showSuggestionsWhenValueIsSet={true}
                                allowCreate={false}
                            />
                        </Col>
                    </Row>
                </Grid >
            </div>
        )
    }

    Targets = ({ meta, t }) => {
        return (
            <div>
                <Grid fluid >
                    <Row className={theme.targetsHead}>
                        <Col lg={7}>
                            {t('TARGET')}
                        </Col>
                        <Col lg={5}>
                            {t('WEIGHT')}
                        </Col>
                    </Row>
                    {
                        (meta.targets || []).map((target) => {
                            return (
                                <Row key={target.name} className={theme.targetRow}>
                                    <Col lg={7}>
                                        {(() => {
                                            switch (target.name) {
                                                case 'location':
                                                    return this.renderLocationTarget(target)
                                                case 'gender':
                                                    return this.renderGendersTarget(target)
                                                case 'age':
                                                    return this.renderAgeTarget(target)
                                                default: null
                                            }
                                        })()}
                                    </Col>
                                    <Col lg={5} style={{ position: 'relative' }}>
                                        <div className={classnames(theme.sliderWrapper)}>
                                            <label className={classnames(theme.sliderLabel, theme.weightLabel)}>
                                                {target.name}  weight:
                                            <strong> {target.weight} </strong>
                                                ({TargetWeightLabels[target.weight]})
                                        </label>
                                            <Slider className={theme.weightSlider}
                                                pinned
                                                snaps
                                                min={0}
                                                max={4}
                                                step={1}
                                                value={target.weight}
                                                onChange={this.handleTargetChange.bind(this, target, 'updateWeight')}
                                            />
                                        </div>
                                    </Col>

                                </Row>
                            )
                        })
                    }
                </Grid>
            </div >
        )
    }

    render() {
        return (
            <this.Targets meta={this.props.item._meta} t={this.props.t} />
        )
    }
}

NewUnitFormTargets.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    title: PropTypes.string,
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

const ItemNewUnitFormTargets = NewItemHoc(NewUnitFormTargets)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(ItemNewUnitFormTargets))
