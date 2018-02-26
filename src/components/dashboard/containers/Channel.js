import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Channel as ChannelModel, AdSlot as AdSlotModel } from 'adex-models'
import ItemHoc from './ItemHoc'
import ItemsList from './ItemsList'
import NewSlotForm from 'components/dashboard/forms/items/NewSlotForm'
import NewSlotFormImgs from 'components/dashboard/forms/items/NewSlotFormImgs'
// import theme from './theme.css'
import AddItemDialog from './AddItemDialog'
import NewItemSteps from 'components/dashboard/forms/items/NewItemSteps'
import theme from './theme.css'
import Translate from 'components/translate/Translate'
import { groupItemsForCollection } from 'helpers/itemsHelpers'
import { items as ItemsConstants } from 'adex-constants'

const { ItemsTypes } = ItemsConstants

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
        // let side = this.props.match.params.side
        // let t = this.props.t
        let item = this.props.item
        // let items = item._items || []
        let propsSlots = { ...this.props.slots }
        

        if (!item) return (<h1>'404'</h1>)

        //TODO: Make it wit HOC for collection (campaing/channel)
        let groupedSlots = groupItemsForCollection({ collectionId: item._id, allItems: propsSlots })

        let slots = groupedSlots.items
        let otherSlots = groupedSlots.otherItems

        return (
            <div>
                <h2>
                    <span>{this.props.t('SLOTS_IN_CHANNEL', { args: [slots.length] })}</span>
                    <span>
                        <div className={theme.newIemToItemBtn} >
                            <AddItemDialog
                                color='second'
                                addCampaign={this.props.actions.addCampaign}
                                btnLabel={this.props.t('NEW_SLOT_TO_CHANNEL')}
                                title=''
                                items={otherSlots}
                                viewMode={VIEW_MODE_UNITS}
                                listMode='rows'
                                addTo={item}
                                tabNewLabel={this.props.t('NEW_SLOT')}
                                tabExsLabel={this.props.t('EXISTING_SLOT')}
                                objModel={AdSlotModel}
                                newForm={(props) =>
                                    <NewItemSteps 
                                        {...props} 
                                        addTo={item} 
                                        itemPages={[NewSlotForm, NewSlotFormImgs]} 
                                        itemType={ItemsTypes.AdSlot.id} 
                                        itemModel={AdSlotModel} 
                                    />
                                }
                            />
                        </div>
                    </span>
                </h2>
                <ItemsList {...this.props} parentItem={item} removeFromItem items={slots} viewModeId={VIEW_MODE} objModel={AdSlotModel} />
            </div>
        )
    }
}

Channel.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    slots: PropTypes.array.isRequired,
    spinner: PropTypes.bool,
    rowsView: PropTypes.bool.isRequired
}

function mapStateToProps(state) {
    let persist = state.persist
    let memory = state.memory
    return {
        account: persist.account,
        slots: persist.items[ItemsTypes.AdSlot.id],
        spinner: memory.spinners[ItemsTypes.Channel.name],
        rowsView: !!persist.ui[VIEW_MODE],
        objModel: ChannelModel,
        itemType: ItemsTypes.Channel.id
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
)(Translate(ChannelItem))
