import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from 'actions/itemActions'
import { ItemsTypes } from 'constants/itemsTypes'
import ItemHoc from './ItemHoc'
import ItemsList from './ItemsList'
import NewUnitForm from 'components/dashboard/forms/NewUnitForm'
// import theme from './theme.css'
import AddItemDialog from './AddItemDialog'
import NewItemSteps from 'components/dashboard/forms/NewItemSteps'

const VIEW_MODE = 'campaignRowsView'
const VIEW_MODE_UNITS = 'campaignAdUNitsRowsView'

export class Channel extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            tabIndex: 0
        }
    }

    handleTabChange = (index) => {
        this.setState({ tabIndex: index })
    }

    render() {
        let side = this.props.match.params.side;

        let item = this.props.item
        let meta = item._meta
        let slots = []
        let otherSlots = this.props.slots.slice(0)
        let t = this.props.t

        if (!item) return (<h1>'404'</h1>)

        for (var index = 0; index < meta.items.length; index++) {
            if (this.props.slots[meta.items[index]] && !this.props.slots[meta.items[index]]._meta.deleted) {
                slots.push(this.props.slots[meta.items[index]])
                otherSlots[meta.items[index]] = null
            }
        }

        return (
            <div>
                <h2>Ad slots in this channel {'(' + (slots.length) + ')'}</h2>
                <div>
                    <AddItemDialog
                        accent
                        addCampaign={this.props.actions.addCampaign}
                        btnLabel='Add new Unit to campaign'
                        title=''
                        items={otherSlots}
                        viewMode={VIEW_MODE_UNITS}
                        listMode='rows'
                        addTo={item}
                        newForm={(props) =>
                            <NewItemSteps {...props} addTo={item} pageTwo={NewUnitForm} itemType={ItemsTypes.AdSlot.id} />
                        }
                    />
                </div>
                <ItemsList parentItem={item} removeFromItem items={slots} viewModeId={VIEW_MODE} />
            </div>
        )
    }
}

Channel.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
    slots: PropTypes.array.isRequired,
    spinner: PropTypes.bool,
    rowsView: PropTypes.bool.isRequired
}

function mapStateToProps(state) {
    // console.log('mapStateToProps ChannelItem', state)
    return {
        account: state.account,
        items: state.items[ItemsTypes.Channel.id],
        slots: state.items[ItemsTypes.AdSlot.id],
        spinner: state.spinners[ItemsTypes.Channel.name],
        rowsView: !!state.ui[VIEW_MODE]
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

const ChannelItem = ItemHoc(Channel)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ChannelItem)
