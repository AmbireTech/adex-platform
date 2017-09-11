
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../../actions/itemActions'
import * as unitActions from './../../../actions/unitActions'
import Rows from './../collection/Rows'
import { ItemsTypes } from './../../../constants/itemsTypes'

export const Campaign = (props) => {
    let side = props.match.params.side;
    let campaignId = props.match.params.campaign;

    // let account = props.account
    let campaigns = props.campaigns
    let item = campaigns[campaignId]
    let units = []

    if (!item) return (<h1>'404'</h1>)

    for (var index = 0; index < item._meta.items.length; index++) {
        units.push(props.units[item._meta.items[index]])
    }

    console.log('units', units)

    return (
        <div>
            <div>
                <h2>Campaign name: {item.name} </h2>
            </div>
            <Rows side={side} item={item} rows={units} remove={props.actions.removeItemFromItem} />
        </div>
    )
}

Campaign.propTypes = {
    actions: PropTypes.object.isRequired,
    unitActions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    campaigns: PropTypes.array.isRequired,
    units: PropTypes.array.isRequired,
};

function mapStateToProps(state) {
    // console.log('mapStateToProps Campaign', state)
    return {
        account: state.account,
        campaigns: state.items[ItemsTypes.Campaign.id],
        units: state.items[ItemsTypes.AdUnit.id],
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch),
        unitActions: bindActionCreators(unitActions, dispatch),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Campaign);
