
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { ItemsTypes, Locations, TargetWeightLabels, Genders, TARGET_MIN_AGE, TARGET_MAX_AGE } from 'constants/itemsTypes'
import theme from './theme.css'
// import { Table, TableHead, TableRow, TableCell } from 'react-toolbox/lib/table'
// import { IconButton, Button } from 'react-toolbox/lib/button'
// import ItemsList from './ItemsList'
// import Rows from 'components/dashboard/collection/Rows'
// import NewItemWithDialog from 'components/dashboard/forms/NewItemWithDialog'
// import BidForm from 'components/dashboard/forms/BidForm'
// import Dialog from 'react-toolbox/lib/dialog'
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

export class UnitTargets extends Component {

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

        let newTargets = AdUnit.updateTargets(this.props.item._meta.targets, target, newValue, newWeight)
        this.props.handleChange('targets', newTargets)
    }

    renderLocationTarget = (target) => {
        return (
            <Autocomplete
                direction="down"
                multiple={true}
                onChange={this.handleTargetChange.bind(this, target, null)}
                label="Location"
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
                direction="down"
                multiple={true}
                onChange={this.handleTargetChange.bind(this, target, null)}
                label="Genders"
                source={AcGenders}
                value={target.value}
                suggestionMatch='anywhere'
                showSuggestionsWhenValueIsSet={true}
                allowCreate={false}
            />
        )
    }

    renderAgeTarget = (target) => {
        return (
            <div>
                <Grid fluid className={theme.agesGrid}>
                    <Row>
                        <Col lg={6}>

                            <Autocomplete
                                direction="down"
                                multiple={false}
                                onChange={this.handleTargetChange.bind(this, target, 'from')}
                                label="Age from"
                                source={ages.slice(0, (target.value.to | 0) + 1)}
                                value={target.value.from + ''}
                                suggestionMatch='anywhere'
                                showSuggestionsWhenValueIsSet={true}
                                allowCreate={false}
                            />
                        </Col>
                        <Col lg={6}>

                            <Autocomplete
                                direction="down"
                                multiple={false}
                                onChange={this.handleTargetChange.bind(this, target, 'to')}
                                label="Age to"
                                source={ages.slice(target.value.from | 0)}
                                value={target.value.to + ''}
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
            <Grid fluid>
                <Row className={theme.targetsHead}>
                    <Col lg={7}>
                        TARGET
                    </Col>
                    <Col lg={5}>
                        Weight
                    </Col>
                </Row>
                {
                    meta.targets.map((target) => {
                        return (<Row key={target.name} className={theme.targetRow}>
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
        )
    }

    render() {
        return (
            <this.Targets meta={this.props.meta} t={this.props.t} />
        )
    }
}

UnitTargets.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    // items: PropTypes.array.isRequired,
    item: PropTypes.object.isRequired,
    slots: PropTypes.array.isRequired,
    spinner: PropTypes.bool
};

function mapStateToProps(state) {
    return {
        account: state.account,
        // items: state.items[ItemsTypes.AdUnit.id],
        slots: state.items[ItemsTypes.AdSlot.id],
        // item: state.currentItem,
        spinner: state.spinners[ItemsTypes.AdUnit.name]
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

// const UnitItem = ItemHoc(UnitSlots)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UnitTargets);
