
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './theme.css'
import { items as ItemsConstants } from 'adex-constants'
import { List, ListItem, ListSubHeader, ListDivider } from 'react-toolbox/lib/list'
import FontIcon from 'react-toolbox/lib/font_icon'

const { ItemsTypes } = ItemsConstants

const targetWeightIcon = {
    0: { icon: 'exposure_zero', color: '#616161' },
    1: { icon: 'looks_one', color: '#03A9F4' },
    2: { icon: 'looks_two', color: '#00E676' },
    3: { icon: 'looks_3', color: '#FFAB00' },
    4: { icon: 'looks_4', color: '#FF5722' },
}

const targetIcon = {
    'location': 'location_on',
    'gender': 'wc',
    'age': 'child_care',
}

export class UnitTargets extends Component {
    targetArrayValues = (target, t) => {
        let icon = targetWeightIcon[target.weight]
        return (
            <span key={target.name}>
                <ListItem
                    ripple={false}
                    caption={t(target.name, { isTarget: true })}
                    legend={target.value.join(', ')}
                    rightIcon={<FontIcon value={icon.icon} style={{ color: icon.color }} />}
                    leftIcon={targetIcon[target.name]}
                    theme={theme}
                />
                <ListDivider />
            </span>
        )
    }

    ageTargets = (target, t) => {
        let icon = targetWeightIcon[target.weight]
        return (
            <span key={target.name}>
                <ListItem
                    ripple={false}
                    caption={t(target.name, { isTarget: true })}
                    legend={'from ' + target.value.from + ' to ' + target.value.to}
                    rightIcon={<FontIcon value={icon.icon} style={{ color: icon.color }} />}
                    leftIcon='child_care'
                    theme={theme}
                />
                <ListDivider />
            </span>
        )
    }

    TargetsList = ({ targets, t }) => (
        <List selectable={false} ripple={false}>
            <ListSubHeader caption='Targets' />
            {
                (targets || []).map((target) => {

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
            <this.TargetsList targets={this.props.targets} t={this.props.t} />
        )
    }
}

UnitTargets.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    item: PropTypes.object.isRequired,
    spinner: PropTypes.bool,
    targets: PropTypes.array.isRequired
};

function mapStateToProps(state) {
    let persist = state.persist
    let memory = state.memory
    return {
        account: persist.account,
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
