import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Channel as ChannelModel, AdSlot as AdSlotModel } from 'adex-models'
import ItemHoc from 'components/dashboard/containers/ItemHoc'
import ItemsList from 'components/dashboard/containers/ItemsList'
import AddItem from 'components/dashboard/containers/AddItem'
import Translate from 'components/translate/Translate'
import { groupItemsForCollection } from 'helpers/itemsHelpers'
import { SORT_PROPERTIES_ITEMS, FILTER_PROPERTIES_ITEMS } from 'constants/misc'
import { NewSlotSteps } from 'components/dashboard/forms/NewItems'
import { items as ItemsConstants } from 'adex-constants'
import WithDialog from 'components/common/dialog/WithDialog'
import AddIcon from '@material-ui/icons/Add'
import AppBar from '@material-ui/core/AppBar'
import Typography from '@material-ui/core/Typography'
import Toolbar from '@material-ui/core/Toolbar'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

const { ItemsTypes } = ItemsConstants

const VIEW_MODE = 'campaignRowsView'
const VIEW_MODE_UNITS = 'campaignAdUNitsRowsView'
const AddItemWitgDialog = WithDialog(AddItem)

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
        const { t, classes, item, } = this.props
        // let items = item._items || []
        const propsSlots = { ...this.props.slots }


        if (!item) return (<h1>'404'</h1>)

        //TODO: Make it wit HOC for collection (campaing/channel)
        const groupedSlots = groupItemsForCollection({ collectionId: item._id, allItems: propsSlots })

        const slots = groupedSlots.items
        const otherSlots = groupedSlots.otherItems

        return (
            <div>
                <AppBar
                    position='static'
                    color='primary'
                    className={classes.appBar}
                >
                    <Toolbar>
                        <Typography
                            variant="title"
                            color="inherit"
                            className={classes.flex}
                        >
                            {t('SLOTS_IN_CHANNEL', { args: [slots.length] })}
                        </Typography>

                        <AddItemWitgDialog
                            color='inherit'
                            icon={<AddIcon />}
                            addCampaign={this.props.actions.addCampaign}
                            btnLabel={t('NEW_SLOT_TO_CHANNEL')}
                            title=''
                            items={otherSlots}
                            viewMode={VIEW_MODE_UNITS}
                            listMode='rows'
                            addTo={item}
                            tabNewLabel={t('NEW_SLOT')}
                            tabExsLabel={t('EXISTING_SLOT')}
                            objModel={AdSlotModel}
                            sortProperties={SORT_PROPERTIES_ITEMS}
                            filterProperties={FILTER_PROPERTIES_ITEMS}
                            newForm={(props) =>
                                <NewSlotSteps
                                    {...props}
                                    addTo={item}
                                />
                            }
                        />
                    </Toolbar>
                </AppBar>                
                <ItemsList
                    {...this.props}
                    parentItem={item}
                    removeFromItem
                    items={slots}
                    viewModeId={VIEW_MODE}
                    objModel={AdSlotModel}
                    sortProperties={SORT_PROPERTIES_ITEMS}
                    filterProperties={FILTER_PROPERTIES_ITEMS}
                />
            </div>
        )
    }
}

Channel.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    slots: PropTypes.object.isRequired,
    rowsView: PropTypes.bool.isRequired
}

function mapStateToProps(state) {
    let persist = state.persist
    // let memory = state.memory
    return {
        account: persist.account,
        slots: persist.items[ItemsTypes.AdSlot.id],
        rowsView: !!persist.ui[VIEW_MODE],
        objModel: ChannelModel,
        itemType: ItemsTypes.Channel.id,
        updateImgInfoLabel: 'CHANNEL_IMG_ADDITIONAL_INFO',
        updateImgLabel: 'CHANNEL_LOGO',
        updateImgErrMsg: 'ERR_IMG_SIZE_MAX',
        updateImgExact: false,
        canEditImg: true,
        showLogo: true
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

const ChannelItem = ItemHoc(withStyles(styles)(Channel))
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(ChannelItem))
