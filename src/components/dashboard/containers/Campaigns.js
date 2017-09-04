
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './../../../actions/campaignActions';
import { ItemTypes } from './../../../models/DummyData';
import Card from './../collection/Card';



export const Campaigns = (props) => {
    let side = props.match.params.side;
    let account = props.account
    console.log('Campaigns props', props)

    return (
        <div>
            <h1>All campaigns </h1>

            {account.items.filter((i) => i.type === ItemTypes.Campaign).map((camp, i) => {
                return (<Card item={camp} name={camp.name} side={side} logo={camp.img} />)
            })}
        </div>
    )
}

Campaigns.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    console.log('mapStateToProps Campaigns', state)
    return {
        account: state.campaigns
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
)(Campaigns);
