import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import ItemHoc from './ItemHoc'
import ItemsList from './ItemsList'
import DatePicker from 'react-toolbox/lib/date_picker'
import theme from './datepicker.css'
import AddItem from './AddItem'
import moment from 'moment'
import FontIcon from 'react-toolbox/lib/font_icon'
import Translate from 'components/translate/Translate'
import { AdUnit as AdUnitModel, Campaign as CampaignModel } from 'adex-models'
import { groupItemsForCollection } from 'helpers/itemsHelpers'
import { SORT_PROPERTIES_ITEMS, FILTER_PROPERTIES_ITEMS } from 'constants/misc'
import { items as ItemsConstants } from 'adex-constants'
import { NewUnitSteps } from 'components/dashboard/forms/NewItems'
import WithDialog from 'components/common/dialog/WithDialog'

const { ItemsTypes } = ItemsConstants

const VIEW_MODE = 'campaignRowsView'
const VIEW_MODE_UNITS = 'campaignAdUNitsRowsView'
const AddItemWitgDialog = WithDialog(AddItem)

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
        let item = this.props.item
        let propsUnits = { ...this.props.units }

        let t = this.props.t

        if (!item) return (<h1>'404'</h1>)

        let from = item.from ? new Date(item.from) : null
        let to = item.to ? new Date(item.to) : null
        let now = new Date()

        //TODO: Make it wit HOC for collection (campaing/channel)
        let groupedUnits = groupItemsForCollection({ collectionId: item._id, allItems: propsUnits })

        let units = groupedUnits.items
        let otherUnits = groupedUnits.otherItems

        return (
            <div>
                <h2>
                    <span>{this.props.t('UNITS_IN_CAMPAIGN', { args: [units.length] })}</span>
                    <span>
                        <div className={theme.newIemToItemBtn}>
                            <AddItemWitgDialog
                                color='second'
                                addCampaign={this.props.actions.addCampaign}
                                btnLabel={t('NEW_UNIT_TO_CAMPAIGN')}
                                title=''
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
                        </div>
                    </span>
                </h2>
                <div className={theme.campaignPeriodContainer}>
                    <FontIcon value="date_range" />
                    <span>{t('from')} </span>
                    <DatePicker
                        minDate={now}
                        maxDate={to}
                        onChange={this.props.handleChange.bind(this, 'from')}
                        value={from}
                        className={theme.datepicker}
                        theme={theme}
                        inputFormat={this.inputFormat}
                        size={moment(from).format('DD MMMM').length} /** temp fix */
                        // readonly
                    />
                    <span>{t('to')} </span>
                    <DatePicker
                        minDate={from || now}
                        onChange={this.props.handleChange.bind(this, 'to')}
                        value={to}
                        className={theme.datepicker}
                        theme={theme}
                        inputFormat={this.inputFormat}
                        size={moment(to).format('DD MMMM').length} /** temp fix */
                        // readonly
                    />

                </div>
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
        canEditImg: true
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
)(Translate(CampaignItem))
