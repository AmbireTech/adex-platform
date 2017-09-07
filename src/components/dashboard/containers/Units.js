
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './../../../actions/campaignActions';
import { ItemTypes } from './../../../models/DummyData';
import Card from './../collection/Card';
import NewCampaignForm from './NewCampaignForm';



export const Units = (props) => {
    let side = props.match.params.side;
    let account = props.account
    // console.log('Campaigns props', props)

    return (
        <div>
            <h1>All campaigns </h1>

            <NewCampaignForm addCampaign={props.actions.addCampaign}/>

            {account._items.filter((i) => i._type === ItemTypes.Campaign).map((camp, i) => {
                return (<Card key={camp._id} item={camp} name={camp._name} side={side} logo={camp._meta.img} delete={props.actions.deleteCampaign} />)
            })}
        </div>
    )
}

Units.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    // console.log('mapStateToProps Campaigns', state)
    return {
        account: state.account
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
