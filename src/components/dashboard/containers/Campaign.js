import React, { Component } from 'react'
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
import NewUnitForm from './../forms/NewUnitForm'
import NewItemWithDialog from './../forms/NewItemWithDialog'
import { Tab, Tabs } from 'react-toolbox'
import theme from './theme.css'

const VIEW_MODE = 'campaignRowsView'

export class Campaign extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            tabIndex: 0
        }

    }

    handleTabChange = (index) => {
        this.setState({ tabIndex: index })
    }

    renderTabs({ units, ...other }) {
        return (
            <section>
                <Tabs theme={theme} fixed index={this.state.tabIndex} onChange={this.handleTabChange.bind(this)}>
                    <Tab label='New Ad Unit'>
                        <NewUnitForm {...other} />
                    </Tab>
                    <Tab theme={theme} label='Add existing Ad Unit'><section style={{ overflowY: 'scroll', height: '100%' }}><ItemsList items={units} viewModeId={VIEW_MODE} /></section></Tab>
                </Tabs>
            </section>
        )
    }

    render() {
        let side = this.props.match.params.side;

        let item = this.props.item
        let meta = item._meta
        let units = []
        let otherUnits = this.props.units.slice(0)

        if (!item) return (<h1>'404'</h1>)

        for (var index = 0; index < meta.items.length; index++) {
            if (this.props.units[meta.items[index]] && !this.props.units[meta.items[index]]._meta.deleted) {
                units.push(this.props.units[meta.items[index]])
                otherUnits[meta.items[index]].used = true
            }
        }

        return (
            <div>
                <h2>Ad units in this campaign </h2>
                <div>
                    <NewItemWithDialog
                        accent
                        addCampaign={this.props.actions.addCampaign}
                        btnLabel="Add new Unit to campaign"
                        title="Add new Unit to campaign"
                        newForm={
                            this.renderTabs.bind(this, { units: otherUnits })
                        }

                    />
                </div>
                <ItemsList items={units} viewModeId={VIEW_MODE} />
            </div>
        )
    }
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
