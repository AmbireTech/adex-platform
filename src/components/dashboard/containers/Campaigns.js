
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../../actions/itemActions'
import { ItemsTypes } from './../../../constants/itemsTypes'
import Card from './../collection/Card'
import NewCampaignForm from './../forms/NewCampaignForm'

export const Campaigns = (props) => {
    let side = props.match.params.side;
    // let account = props.account
    let campaigns = props.campaigns
    // console.log('Campaigns props', campaigns)

    return (
        <div>
            <h1>All campaigns </h1>

            <NewCampaignForm addCampaign={props.actions.addItem} btnLabel="Add new campaign" title="Add new campaign" />

            {campaigns
                .filter((c) => !!c && c._meta && !c._meta.deleted)
                .sort((a, b) => b._id - a._id)
                .slice(0, 5)
                .map((camp, i) => {
                    return (<Card key={camp._id} item={camp} name={camp._name} side={side} logo={camp._meta.img} delete={props.actions.deleteItem.bind(this, camp)} />)
                })}
        </div>
    )
}

Campaigns.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    campaigns: PropTypes.array.isRequired,
};

function mapStateToProps(state) {
    // console.log('mapStateToProps Campaigns', state)
    return {
        account: state.account,
        campaigns: state.items[ItemsTypes.Campaign.id]
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
