
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './../../../actions/campaignActions';
import Rows from './../collection/Rows';

export const Campaign = (props) => {
    let side = props.match.params.side;
    let campaign = props.match.params.campaign;

    let account = props.account
    let item = account._items.filter((i) => i.id === campaign)[0]

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
    account: PropTypes.object.isRequired
};

function mapStateToProps(state) {
    // console.log('mapStateToProps Campaign', state)
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
)(Campaign);
