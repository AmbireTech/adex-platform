
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import { items as ItemsConstants } from 'adex-constants'
import { List, ListItem, ListSubHeader, ListDivider } from 'react-toolbox/lib/list'

const { ItemsTypes } = ItemsConstants

const targetWeightIcon = {
    0: 'exposure_zero',
    1: 'filter_1',
    2: 'filter_2',
    3: 'filter_3',
    4: 'filter_4',
}

const targetIcon = {
    'location': 'location_on',
    'gender': 'wc',
    'age': 'child_care',
}

export class UnitTargets extends Component {
    targetArrayValues = (target, t) => (
        <span key={target.name}>
            <ListItem
                ripple={false}
                caption={t(target.name, { isTarget: true })}
                legend={target.value.join(', ')}
                rightIcon={targetWeightIcon[target.weight]}
                leftIcon={targetIcon[target.name]}
                theme={theme}
            />
            <ListDivider />
        </span>
    )

    ageTargets = (target, t) => (
        <span key={target.name}>
            <ListItem
                ripple={false}
                caption={t(target.name, { isTarget: true })}
                legend={'from ' + target.value.from + ' to ' + target.value.from}
                rightIcon={targetWeightIcon[target.weight]}
                leftIcon='child_care'
            />
            <ListDivider />
        </span>
    )

    TargetsList = ({ meta, t }) => (
        <List selectable={false} ripple={false}>
            <ListSubHeader caption='Targets' />
            {
                (meta.targets || []).map((target) => {

                    switch (target.name) {
                        case 'location':
                            return this.targetArrayValues(target, t)
                        case 'gender':
                            return this.targetArrayValues(target, t)
                        case 'age':
                            return this.ageTargets(target, t)
                        default: null
                    }
                })
            }
        </List>
    )

    render() {
        return (
            <this.TargetsList meta={this.props.meta} t={this.props.t} />
        )
    }
}

UnitTargets.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    item: PropTypes.object.isRequired,
    slots: PropTypes.array.isRequired,
    spinner: PropTypes.bool
};

function mapStateToProps(state) {
    let persist = state.persist
    let memory = state.memory
    return {
        account: persist.account,
        slots: [],
        spinner: memory.spinners[ItemsTypes.AdUnit.name]
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UnitTargets);
