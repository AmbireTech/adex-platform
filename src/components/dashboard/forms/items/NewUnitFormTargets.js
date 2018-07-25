import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import NewItemHoc from './NewItemHocStep'
import Translate from 'components/translate/Translate'
import { AdUnit } from 'adex-models'
import Grid from '@material-ui/core/Grid'
import Autocomplete from 'components/common/autocomplete'
import { items as ItemsConstants } from 'adex-constants'
import Slider from '@material-ui/lab/Slider'
import Typography from '@material-ui/core/Typography'
import { translate } from 'services/translations/translations'
import { getTags } from 'services/adex-node/actions'

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
        genders[gen.value] = translate(gen.label)
    })

    return genders
}

const AcGenders = autocompleteGenders()

const ages = (() => {
    let ages = []
    for (var index = TARGET_MIN_AGE; index <= TARGET_MAX_AGE; index++) {
        ages.push({ label: index + '', value: index + '' })
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
                multiple
                openOnClick
                onChange={this.handleTargetChange.bind(this, target, null)}
                label={this.props.t('TARGET_LOCATION')}
                placeholder={this.props.t('TARGET_LOCATION_PLACEHOLDER')}
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
                direction='auto'
                multiple
                openOnClick
                onChange={this.handleTargetChange.bind(this, target, null)}
                label={this.props.t('TARGET_GENDERS')}
                placeholder={this.props.t('TARGET_GENDERS_PLACEHOLDER')}
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
                //  className={theme.agesGrid}
                >
                    <Grid item lg={6}>

                        <Autocomplete
                            id='age-target-from-select'
                            direction="auto"
                            openOnClick
                            onChange={this.handleTargetChange.bind(this, target, 'from')}
                            label={this.props.t('TARGET_AGE_FROM')}
                            placeholder={this.props.t('TARGET_AGE_FROM_PLACEHOLDER')}
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
                            openOnClick
                            onChange={this.handleTargetChange.bind(this, target, 'to')}
                            label={this.props.t('TARGET_AGE_TO')}
                            placeholder={this.props.t('TARGET_AGE_TO_PLACEHOLDER')}
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
                <Grid container spacing={16}>
                    <Grid
                        item
                        container xs={12}
                        spacing={16}
                        alignItems='flex-end'
                    >
                        <Grid item xs={12} md={7}>
                            {t('TARGET')}
                        </Grid>
                        <Grid item xs={12} md={5}>
                            {t('WEIGHT')}
                        </Grid>
                    </Grid>
                    {
                        (meta.targets || []).map((target) => {
                            return (
                                <Grid
                                    item
                                    container
                                    xs={12}
                                    key={target.name}
                                    spacing={16}
                                    alignItems='flex-end'
                                >
                                    <Grid
                                        item
                                        key={target.name}
                                        xs={12}
                                        md={7}
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
                                    <Grid item xs={12} md={5} >
                                        <div
                                            style={{ flex: '1' }}
                                        >
                                            <Typography noWrap id="page-size">
                                                {/*TODO: Translate target name*/}
                                                {t('TARGET_WEIGHT_LABEL', { args: [target.name, target.weight, t(TargetWeightLabels[target.weight].label)] })}
                                            </Typography>
                                            <Slider
                                                aria-labelledby={target.name + '-weight'}
                                                min={0} max={4}
                                                step={1}
                                                value={target.weight}
                                                onChange={(ev, val) => this.handleTargetChange(target, 'updateWeight', val)}
                                            />
                                        </div>
                                    </Grid>
                                </Grid>
                            )
                        })
                    }

                    <Grid
                        item
                        container xs={12}
                        spacing={16}
                        alignItems='flex-end'
                    >
                    </Grid>
                </Grid>
            </div >
        )
    }

    render() {
        return (
            <div>
                <this.Targets meta={this.props.item._meta} t={this.props.t} />
            </div>
        )
    }
}

NewUnitFormTargets.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    title: PropTypes.string,
    tags: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    let persist = state.persist
    // let memory = state.memory
    return {
        account: persist.account,
        itemType: ItemsTypes.AdUnit.id,
        tags: persist.tags
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
