import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import NewItemHoc from './NewItemHocStep'
import Translate from 'components/translate/Translate'
import theme from './../theme.css'
import { AdUnit } from 'adex-models'
import Grid from '@material-ui/core/Grid'
import Autocomplete from 'components/common/autocomplete'
import classnames from 'classnames'
import Slider from 'react-toolbox/lib/slider'
import { items as ItemsConstants } from 'adex-constants'

const { ItemsTypes, Locations, TargetWeightLabels, Genders, TARGET_MIN_AGE, TARGET_MAX_AGE } = ItemsConstants

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
        ages.push({ label: index + '' })
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
                id='location-targets-select'
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
                id='genders-targets-select'
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
                <Grid
                    container
                    spacing={16}
                // className={theme.agesGrid}
                >
                    <Grid item lg={6}>

                        <Autocomplete
                            id='age-target-from-select'
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
                    </Grid>
                    <Grid item lg={6}>

                        <Autocomplete
                            id='age-target-to-select'
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
                    </Grid>
                </Grid >
            </div>
        )
    }

    Targets = ({ meta, t }) => {
        return (
            <div>
                <Grid container >
                    <Grid
                        item
                        className={theme.targetsHead}

                        lg={7}>
                        {t('TARGET')}
                    </Grid>
                    <Grid item lg={5}>
                        {t('WEIGHT')}
                    </Grid>
                    {
                        (meta.targets || []).map((target) => {
                            // if (target.name !== 'location') return null
                            return (
                                <Grid container spacing={16} key={target.name}>
                                    <Grid
                                        item
                                        key={target.name}
                                        className={theme.targetRow}
                                        lg={7}
                                    >
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
                                    </Grid>
                                    <Grid item lg={5} style={{ position: 'relative' }}>
                                        <div className={classnames(theme.sliderWrapper)}>
                                            <label className={classnames(theme.sliderLabel, theme.weightLabel)}>
                                                {target.name}  weight:
                                            <strong> {target.weight} </strong>
                                                ({TargetWeightLabels[target.weight].label})
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
                                    </Grid>
                                </Grid>
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
