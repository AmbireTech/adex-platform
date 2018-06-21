import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader'
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import WcIcon from '@material-ui/icons/Wc';
import ChildCareIcon from '@material-ui/icons/ChildCare';
import ExposureZeroIcon from '@material-ui/icons/ExposureZero';
import LooksOneIcon from '@material-ui/icons/LooksOne';
import LooksTwoIcon from '@material-ui/icons/LooksTwo';
import Looks3Icon from '@material-ui/icons/Looks3';
import Looks4Icon from '@material-ui/icons/Looks4';

const targetWeightIcon = {
    0: { icon: ExposureZeroIcon, color: '#616161' },
    1: { icon: LooksOneIcon, color: '#03A9F4' },
    2: { icon: LooksTwoIcon, color: '#00E676' },
    3: { icon: Looks3Icon, color: '#FFAB00' },
    4: { icon: Looks4Icon, color: '#FF5722' },
}

const targetIcon = {
    'location': LocationOnIcon,
    'gender': WcIcon,
    'age': ChildCareIcon,
}

export class UnitTargets extends Component {
    targetArrayValues = (target, t) => {
        const weightIcon = targetWeightIcon[target.weight]
        const TargetIcon = targetIcon[target.name]
        return (
            <span key={target.name}>
                <ListItem
                >
                    <ListItemIcon>
                        <TargetIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={t(target.name, { isTarget: true })}
                        secondary={target.value.join(', ')}
                    />
                    <ListItemSecondaryAction>
                        <weightIcon.icon style={{ color: weightIcon.color }} />
                    </ListItemSecondaryAction>
                </ListItem>
                <Divider />
            </span>
        )
    }

    ageTargets = (target, t) => {
        const weightIcon = targetWeightIcon[target.weight]
        return (
            <span key={target.name}>
                <ListItem
                >
                    <ListItemIcon>
                        <ChildCareIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={t(target.name, { isTarget: true })}
                        secondary={'from ' + target.value.from + ' to ' + target.value.to}
                    />
                    <ListItemSecondaryAction>
                        <weightIcon.icon style={{ color: weightIcon.color }} />
                    </ListItemSecondaryAction>
                </ListItem>
                <Divider />
            </span>
        )
    }

    TargetsList = ({ targets, subHeader, t, ...rest }) => (
        <List
            dense
            subheader={subHeader ? <ListSubheader caption={t('TARGETS')} /> : null}
        >
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
            <this.TargetsList {...this.props} />
        )
    }
}

UnitTargets.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    item: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    const persist = state.persist
    // const memory = state.memory
    return {
        account: persist.account
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UnitTargets);
