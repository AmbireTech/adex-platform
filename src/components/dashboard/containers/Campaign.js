
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as campaignActions from './../../../actions/campaignActions'
import * as unitActions from './../../../actions/unitActions'
import Rows from './../collection/Rows'
// import { ItemsTypes } from './../../../constants/itemsTypes'

export const Campaign = (props) => {
    let side = props.match.params.side;
    let campaignId = props.match.params.campaign;

    // let account = props.account
    let campaigns = props.campaigns
    let item = campaigns[campaignId]
    let units = []

    if (!item) return (<h1>'404'</h1>)

    for (var index = 0; index < item._meta.units.length; index++) {
        units.push(props.units[item._meta.units[index]])
    }

    console.log('units', units)

    return (
        <div>
            <div>
                <h2>Campaign name: {item.name} </h2>
            </div>
            <Rows side={side} item={item} rows={units} remove={props.campaignActions.removeUnitFromCampaign} />
        </div>
    )
}

Campaign.propTypes = {
    campaignActions: PropTypes.object.isRequired,
    unitActions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    campaigns: PropTypes.array.isRequired,
    units: PropTypes.array.isRequired,
};

function mapStateToProps(state) {
    // console.log('mapStateToProps Campaign', state)
    return {
        account: state.account,
        campaigns: state.campaigns,
        units: state.units,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        campaignActions: bindActionCreators(campaignActions, dispatch),
        unitActions: bindActionCreators(unitActions, dispatch),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Campaign);
