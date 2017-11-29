import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { ItemsTypes } from 'constants/itemsTypes'
import CampaignModel from 'models/Campaign'
import ItemHoc from './ItemHoc'
import ItemsList from './ItemsList'
import NewUnitForm from 'components/dashboard/forms/NewUnitForm'
import DatePicker from 'react-toolbox/lib/date_picker'
import theme from './campaign.css'
import AddItemDialog from './AddItemDialog'
import NewItemSteps from 'components/dashboard/forms/NewItemSteps'
import moment from 'moment'
import FontIcon from 'react-toolbox/lib/font_icon'
import Translate from 'components/translate/Translate'
import AdUnitModel from 'models/AdUnit'

const VIEW_MODE = 'campaignRowsView'
const VIEW_MODE_UNITS = 'campaignAdUNitsRowsView'

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
        let side = this.props.match.params.side;
        let item = this.props.item
        let meta = item._meta
        let propsUnits = { ...this.props.units }
        let units = []
        let otherUnits = Array.from(Object.values(propsUnits))

        let t = this.props.t

        if (!item) return (<h1>'404'</h1>)

        let from = item._meta.from ? new Date(item._meta.from) : null
        let to = item._meta.to ? new Date(item._meta.to) : null

        for (var index = 0; index < meta.items.length; index++) {
            if (propsUnits[meta.items[index]] && !propsUnits[meta.items[index]]._meta.deleted) {
                units.push(propsUnits[meta.items[index]])
                otherUnits[meta.items[index]] = null
            }
        }

        return (
            <div>
                <h2>
                    <span>{this.props.t('UNITS_IN_CAMPAIGN', { args: [units.length] })}</span>
                    <span>
                        <div className={theme.newIemToItemBtn}>
                            <AddItemDialog
                                color='second'
                                addCampaign={this.props.actions.addCampaign}
                                btnLabel={this.props.t('NEW_UNIT_TO_CAMPAIGN')}
                                title=''
                                items={otherUnits}
                                viewMode={VIEW_MODE_UNITS}
                                listMode='rows'
                                addTo={item}
                                tabNewLabel={this.props.t('NEW_UNIT')}
                                tabExsLabel={this.props.t('EXISTING_UNIT')}
                                objModel={AdUnitModel}
                                newForm={(props) =>
                                    <NewItemSteps {...props} addTo={item} itemPages={[NewUnitForm]} itemType={ItemsTypes.AdUnit.id} itemModel={AdUnitModel} />
                                }
                            />
                        </div>
                    </span>
                </h2>
                <div className={theme.campaignPeriodContainer}>
                    <FontIcon value="date_range" />
                    <span>{t('from')} </span>
                    <DatePicker
                        minDate={new Date()}
                        onChange={this.props.handleChange.bind(this, 'from')}
                        value={from}
                        className={theme.datepicker}
                        theme={theme}
                        inputFormat={this.inputFormat}
                        size={moment(from).format('MMMM').length} /** temp fix */
                    />
                    <span>{t('to')} </span>
                    <DatePicker
                        minDate={new Date()}
                        onChange={this.props.handleChange.bind(this, 'to')}
                        value={to}
                        className={theme.datepicker}
                        theme={theme}
                        inputFormat={this.inputFormat}
                        size={moment(to).format('MMMM').length} /** temp fix */
                    />

                </div>
                <ItemsList parentItem={item} removeFromItem items={units} viewModeId={VIEW_MODE} objModel={AdUnitModel} />
            </div>
        )
    }
}

Campaign.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    // items: PropTypes.array.isRequired,
    units: PropTypes.object.isRequired,
    spinner: PropTypes.bool,
    rowsView: PropTypes.bool.isRequired
}

function mapStateToProps(state) {
    let persist = state.persist
    let memory = state.memory
    return {
        account: persist.account,
        units: persist.items[ItemsTypes.AdUnit.id],
        spinner: memory.spinners[ItemsTypes.Campaign.name],
        rowsView: !!persist.ui[VIEW_MODE],
        objModel: CampaignModel,
        itemType: ItemsTypes.Campaign.id
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
