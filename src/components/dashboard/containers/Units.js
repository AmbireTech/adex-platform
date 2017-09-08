
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './../../../actions/unitActions';
// import { ItemsTypes } from './../../../constants/ItemsTypes';
import Card from './../collection/Card';
import NewUnitForm from './../forms/NewUnitForm';



export const Units = (props) => {
    let side = props.match.params.side;
    let account = props.account
    let units = props.units
    // console.log('Campaigns props', props)

    return (
        <div>
            <h1>All units </h1>

            <NewUnitForm addCampaign={props.actions.addCampaign} />

            {units
                .filter((i) => !!i && !!i._meta && !i._meta.deleted)
                .sort((a, b) => b._id - a._id)
                .map((camp, i) => {
                    return (<Card key={camp._id} item={camp} name={camp._name} side={side} logo={camp._meta.img} delete={props.actions.deleteUnit} />)
                })}
        </div>
    )
}

Units.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    units: PropTypes.array.isRequired
};

function mapStateToProps(state) {
    // console.log('mapStateToProps Campaigns', state)
    return {
        account: state.account,
        units: state.units
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
)(Units);
