import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import ItemHoc from 'components/dashboard/containers/ItemHoc'
import ItemsList from 'components/dashboard/containers/ItemsList'
import AddItem from 'components/dashboard/containers/AddItem'
import moment from 'moment'
import Translate from 'components/translate/Translate'
import { AdUnit as AdUnitModel, Campaign as CampaignModel } from 'adex-models'
import { SORT_PROPERTIES_ITEMS, FILTER_PROPERTIES_ITEMS } from 'constants/misc'
import { items as ItemsConstants } from 'adex-constants'
import WithDialog from 'components/common/dialog/WithDialog'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { CampaignProps } from 'components/dashboard/containers/ItemCommon'
import UnitTargets from 'components/dashboard/containers/UnitTargets'

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
		const { t, classes, item, setActiveFields, handleChange, activeFields, isDemo, ...rest } = this.props
		if (!item) return (<h1>'404'</h1>)

		const units = item.spec.adUnits.map(u => {
			const tempUnit = { ...u }
			tempUnit.id = tempUnit.created
			return tempUnit
		})

		const campaign = new CampaignModel(item)

		return (
			<div>
				<CampaignProps
					item={campaign}
					t={t}
					rightComponent={
						<UnitTargets
							{...rest}
							targets={campaign.targeting}
							t={t}
							subHeader={t('CAMPAIGN_TARGETING')}
						/>}
				/>
				<ItemsList
					removeFromItem
					items={units}
					viewModeId={VIEW_MODE}
					itemType='AdUnit'
					objModel={AdUnitModel}
					sortProperties={SORT_PROPERTIES_ITEMS}
					filterProperties={FILTER_PROPERTIES_ITEMS}
					uiStateId='campaign-units'
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
		units: persist.items['AdUnit'],
		rowsView: !!persist.ui[VIEW_MODE],
		objModel: CampaignModel,
		itemType: 'Campaign'
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
