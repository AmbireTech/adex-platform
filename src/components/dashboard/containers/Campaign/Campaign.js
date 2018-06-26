import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import ItemHoc from 'components/dashboard/containers/ItemHoc'
import ItemsList from 'components/dashboard/containers/ItemsList'
import DatePicker from 'components/common/DatePicker'
import AddItem from 'components/dashboard/containers/AddItem'
import moment from 'moment'
import Translate from 'components/translate/Translate'
import { AdUnit as AdUnitModel, Campaign as CampaignModel } from 'adex-models'
import { groupItemsForCollection } from 'helpers/itemsHelpers'
import { SORT_PROPERTIES_ITEMS, FILTER_PROPERTIES_ITEMS } from 'constants/misc'
import { items as ItemsConstants } from 'adex-constants'
import { NewUnitSteps } from 'components/dashboard/forms/items/NewItems'
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
const AddItemWithDialog = WithDialog(AddItem)

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

    inputFormat = (value) => {
        return moment(value).format('DD MMMM')
    }

    render() {
        // let side = this.props.match.params.side
        const { t, classes, item } = this.props
        const propsUnits = { ...this.props.units }

        if (!item) return (<h1>'404'</h1>)

        const from = item.from ? new Date(item.from) : null
        const to = item.to ? new Date(item.to) : null
        const now = new Date()

        //TODO: Make it wit HOC for collection (campaing/channel)
        const groupedUnits = groupItemsForCollection({ collectionId: item._id, allItems: propsUnits })

        const units = groupedUnits.items
        const otherUnits = groupedUnits.otherItems

        return (
            <div>
                <div >
                    <DatePicker
                        calendarIcon
                        label={this.props.t('from', { isProp: true })}
                        // minDate={now}
                        maxDate={to}
                        onChange={(val) => this.props.handleChange('from', val)}
                        value={from}
                        className={classes.datepicker}
                    // inputFormat={this.inputFormat}
                    // size={moment(from).format('DD MMMM').length} /** temp fix */
                    // readonly
                    />
                    <DatePicker
                        calendarIcon
                        label={this.props.t('to', { isProp: true })}
                        minDate={from || now}
                        onChange={(val) => this.props.handleChange('to', val)}
                        value={to}
                        className={classes.datepicker}
                    // inputFormat={this.inputFormat}
                    // size={moment(to).format('DD MMMM').length} /** temp fix */
                    // readonly
                    />

                </div>
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
                            {this.props.t('UNITS_IN_CAMPAIGN', { args: [units.length] })}
                        </Typography>

                        <AddItemWithDialog
                            color='inherit'
                            icon={<AddIcon />}
                            addCampaign={this.props.actions.addCampaign}
                            btnLabel={t('NEW_UNIT_TO_CAMPAIGN')}
                            title={t('NEW_UNIT_TO_CAMPAIGN')}
                            items={otherUnits}
                            viewMode={VIEW_MODE_UNITS}
                            listMode='rows'
                            addTo={item}
                            tabNewLabel={t('NEW_UNIT')}
                            tabExsLabel={t('EXISTING_UNIT')}
                            objModel={AdUnitModel}
                            itemModel={AdUnitModel}
                            sortProperties={SORT_PROPERTIES_ITEMS}
                            filterProperties={FILTER_PROPERTIES_ITEMS}
                            newForm={(props) =>
                                <NewUnitSteps
                                    {...props}
                                    addTo={item}
                                />
                            }
                        />

                    </Toolbar>
                </AppBar>
                <ItemsList
                    parentItem={item}
                    removeFromItem
                    items={units}
                    viewModeId={VIEW_MODE}
                    bjModel={AdUnitModel}
                    sortProperties={SORT_PROPERTIES_ITEMS}
                    filterProperties={FILTER_PROPERTIES_ITEMS}
                />
            </div>
        )
    }
}

Campaign.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    units: PropTypes.object.isRequired,
    rowsView: PropTypes.bool.isRequired
}

function mapStateToProps(state) {
    let persist = state.persist
    // let memory = state.memory
    return {
        account: persist.account,
        units: persist.items[ItemsTypes.AdUnit.id],
        rowsView: !!persist.ui[VIEW_MODE],
        objModel: CampaignModel,
        itemType: ItemsTypes.Campaign.id,
        updateImgInfoLabel: 'CAMPAIGN_IMG_ADDITIONAL_INFO',
        updateImgLabel: 'CAMPAIGN_LOGO',
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

const CampaignItem = ItemHoc(withStyles(styles)(Campaign))
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(CampaignItem))
