import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { ItemsTypes } from 'constants/itemsTypes'
import ItemHoc from './ItemHoc'
import ItemsList from './ItemsList'
import NewUnitForm from 'components/dashboard/forms/NewUnitForm'
import DatePicker from 'react-toolbox/lib/date_picker'
import theme from './campaign.css'
import AddItemDialog from './AddItemDialog'
import NewItemSteps from 'components/dashboard/forms/NewItemSteps'
import moment from 'moment'
import FontIcon from 'react-toolbox/lib/font_icon'

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
        let units = []
        let otherUnits = this.props.units.slice(0)
        let t = this.props.t

        if (!item) return (<h1>'404'</h1>)

        let from = item._meta.from ? new Date(item._meta.from) : null
        let to = item._meta.to ? new Date(item._meta.to) : null

        for (var index = 0; index < meta.items.length; index++) {
            if (this.props.units[meta.items[index]] && !this.props.units[meta.items[index]]._meta.deleted) {
                units.push(this.props.units[meta.items[index]])
                otherUnits[meta.items[index]] = null
            }
        }

        return (
            <div>
                <h2>
                    <span> Units in this campaign {'(' + (units.length) + ')'}</span>

                    <span>
                        <div className={theme.newIemToItemBtn}>
                            <AddItemDialog
                                color='second'
                                addCampaign={this.props.actions.addCampaign}
                                btnLabel='Add new Unit to campaign'
                                title=''
                                items={otherUnits}
                                viewMode={VIEW_MODE_UNITS}
                                listMode='rows'
                                addTo={item}
                                newForm={(props) =>
                                    <NewItemSteps {...props} addTo={item} itemPages={[NewUnitForm]} itemType={ItemsTypes.AdUnit.id} />
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
                <ItemsList parentItem={item} removeFromItem items={units} viewModeId={VIEW_MODE} />
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
