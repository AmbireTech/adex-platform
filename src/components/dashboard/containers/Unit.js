
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../../actions/itemActions'
// import { ItemsTypes } from './../../../constants/itemsTypes'

export const Unit = (props) => {
    // let side = props.match.params.side;
    let campaign = props.match.params.campaign;
    let unit = props.match.params.unit;

    // let account = props.account
    let item = props.units[unit]

    if (!item) return (<h1>Unit '404'</h1>)

    return (
        <div>
            <h2>AdUnit</h2>
            <h2>Unite: {item._name} </h2>
        </div>
    )
}

Unit.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    units: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    // console.log('mapStateToProps Campaign', state)
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
)(Unit);
