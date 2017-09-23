
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './../../../actions/itemActions'
import Rows from './../collection/Rows'
import Card from './../collection/Card'
import { ItemsTypes } from './../../../constants/itemsTypes'
import { IconButton } from 'react-toolbox/lib/button'
import ItemHoc from './ItemHoc'
import ItemsList from './ItemsList'

const VIEW_MODE = 'campaignRowsView'

export const Campaign = (props) => {
    let side = props.match.params.side;

    let item = props.item
    let meta = item._meta
    let units = []

    if (!item) return (<h1>'404'</h1>)

    for (var index = 0; index < meta.items.length; index++) {
        if (props.units[meta.items[index]]) units.push(props.units[meta.items[index]])
    }

    units = units.slice(0, 5)

    return (
        <div>
            <ItemsList items={units} viewModeId={VIEW_MODE} />
        </div>
    )
}

Campaign.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
    units: PropTypes.array.isRequired,
    spinner: PropTypes.bool,
    rowsView: PropTypes.bool.isRequired
}

function mapStateToProps(state) {
    // console.log('mapStateToProps Campaign', state)
    return {
        account: state.account,
        items: state.items[ItemsTypes.Campaign.id],
        units: state.items[ItemsTypes.AdUnit.id],
        spinner: state.spinners[ItemsTypes.Campaign.name],
        rowsView: !!state.ui[VIEW_MODE]
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

const CampaignItem = ItemHoc(Campaign)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CampaignItem)
