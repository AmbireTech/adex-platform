
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../../actions/campaignActions'
import Rows from './../collection/Rows'
// import { ItemsTypes } from './../../../constants/itemsTypes'

export const Campaign = (props) => {
    let side = props.match.params.side;
    let campaignId = props.match.params.campaign;

    // let account = props.account
    let campaigns = props.campaigns
    let item = campaigns[campaignId]

    if (!item) return (<h1>'404'</h1>)

    return (
        <div>
            <div>
                <h2>Campaign name: {item.name} </h2>
            </div>
            <Rows side={side} item={item} />
        </div>
    )
}

Campaign.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    campaigns: PropTypes.array.isRequired,
};

function mapStateToProps(state) {
    // console.log('mapStateToProps Campaign', state)
    return {
        account: state.account,
        campaigns: state.campaigns
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
)(Campaign);
