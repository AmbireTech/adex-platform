
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../../actions/itemActions'
import { ItemsTypes } from './../../../constants/itemsTypes'
import Card from './../collection/Card'
import NewUnitForm from './../forms/NewUnitForm'
import Rows from './../collection/Rows'
import { IconButton } from 'react-toolbox/lib/button'
import SomeList from './../../list/SomeList'

const VIEW_MODE = 'unitsRowsView'

class Units extends Component {
    constructor(props, context) {
        super(props, context)
        this.toggleView = this.toggleView.bind(this)
    }

    toggleView() {
        this.props.actions.updateUi(VIEW_MODE, !this.props.rowsView)
    }

    render() {
        let side = this.props.match.params.side;

        let units = this.props.units

        return (
            <div>
                <h1>All units </h1>
                <div>
                    <NewUnitForm addCampaign={this.props.actions.addCampaign} btnLabel="Add new Unit" title="Add new unit" />
                </div>

                <SomeList items={units} viewModeId={VIEW_MODE} />
            </div>
        )
    }
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
        units: state.items[ItemsTypes.AdUnit.id]
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
