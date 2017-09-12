
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../../actions/itemActions'
import Rows from './../collection/Rows'
import Card from './../collection/Card'
import { ItemsTypes } from './../../../constants/itemsTypes'
import { IconButton } from 'react-toolbox/lib/button'

const VIEW_MODE = 'campaignRowsView'

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

    return (
        <div>
            <div>
                <h2>Campaign name: {item.name} </h2>
                <div>Campaign units: </div>
                <div>
                    <IconButton icon='view_module' primary onClick={props.actions.updateUi.bind(this, VIEW_MODE, !props.rowsView)} />
                    <IconButton icon='view_list' primary onClick={props.actions.updateUi.bind(this, VIEW_MODE, !props.rowsView)} />
                </div>
            </div>

            {props.rowsView ?
                <Rows side={side} item={item} rows={units} remove={props.actions.removeItemFromItem} />
                :

                units
                    .map((unt, i) => {
                        return (<Card key={unt._id} item={unt} name={unt._name} side={side} logo={unt._meta.img} delete={props.actions.removeItemFromItem.bind(this, { item: item, toRemove: unt._id })} />)
                    })
            }
        </div>
    )
}

Campaign.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    campaigns: PropTypes.array.isRequired,
    units: PropTypes.array.isRequired,
    rowsView: PropTypes.bool.isRequired
};

function mapStateToProps(state) {
    // console.log('mapStateToProps Campaign', state)
    return {
        account: state.account,
        campaigns: state.items[ItemsTypes.Campaign.id],
        units: state.items[ItemsTypes.AdUnit.id],
        rowsView: !!state.ui[VIEW_MODE]
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
