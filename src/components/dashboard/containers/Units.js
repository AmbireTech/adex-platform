
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

class Units extends Component {
    constructor(props, context) {
        super(props, context);
        this.toggleView = this.toggleView.bind(this);

        // TODO: keep this state in the store
        this.state = {
            rowsView: false
        };
    }

    toggleView() {
        this.setState({ rowsView: !this.state.rowsView })
    }

    render() {
        let side = this.props.match.params.side;
        // let account = this.props.account
        let units = this.props.units
            .filter((i) => !!i && !!i._meta && !i._meta.deleted)
            .sort((a, b) => b._id - a._id)

        return (
            <div>
                <h1>All units </h1>
                <div>
                    <NewUnitForm addCampaign={this.props.actions.addCampaign} btnLabel="Add new Unit" title="Add new unit" />
                    <IconButton icon='view_module' primary onClick={this.toggleView} />
                    <IconButton icon='view_list' primary onClick={this.toggleView} />
                </div>

                {this.state.rowsView ?
                    <Rows side={side} item={units} rows={units} delete={this.props.actions.deleteItem} />
                    :

                    units
                        .map((unt, i) => {
                            return (<Card key={unt._id} item={unt} name={unt._name} side={side} logo={unt._meta.img} delete={this.props.actions.deleteItem.bind(this, unt)} />)
                        })
                }
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
