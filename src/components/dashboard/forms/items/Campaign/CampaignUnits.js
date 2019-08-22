import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NewCampaignHoc from './NewCampaignHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import { ContentBody } from 'components/common/dialog/content'
import ItemsList from 'components/dashboard/containers/ItemsList'
import { AdUnit } from 'adex-models'
import { NewUnitDialog } from 'components/dashboard/forms/items/NewItems';
import {
	SORT_PROPERTIES_ITEMS,
	FILTER_PROPERTIES_ITEMS
} from 'constants/misc'

class CampaignUnits extends Component {
	constructor(props) {
		super(props)

		this.state = {
			selected: (props.newItem.adUnits.reduce((selected, unit) => {
				selected[unit.ipfs] = true
				return selected
			}, {})) || {}
		}
	}

	componentDidMount() {
		const { newItem } = this.props
		this.validateUnits(newItem.adUnits, true)
	}

	validateUnits(adUnits, dirty) {
		const isValid = !!adUnits.length
		this.props.validate(
			'adUnits',
			{
				isValid: isValid,
				err: { msg: 'ERR_ADUNITS_REQIURED' },
				dirty: dirty
			})
	}

	handleSelect = (ipfs, checked) => {
		const newSelected = { ...this.state.selected }
		const { adUnits, handleChange } = this.props

		if (checked) {
			newSelected[ipfs] = true
		} else {
			delete newSelected[ipfs]
		}

		this.setState({ selected: newSelected })
		const units = Object.keys(newSelected).map(key => {
			return adUnits[key]
		})

		handleChange('adUnits', units)
		this.validateUnits(units, true)
	}

	render() {
		const { adUnitsArray, t } = this.props
		const hasAdUnits = (adUnitsArray && adUnitsArray.length)
		return (
			<div>
				<Grid
					container
					spacing={2}
					direction={hasAdUnits ? "" : "column"}
					alignItems={hasAdUnits ? "" : "center"}
				>
					<Grid item sm={12}>

						<ContentBody>
							{(adUnitsArray && adUnitsArray.length) ? 
								(<ItemsList
									objModel={AdUnit}
									selectMode
									selectedItems={this.state.selected}
									onSelect={(unit, checked) => {
										this.handleSelect(unit, checked)
									}}
									items={adUnitsArray}
									listMode='rows'
									itemType={'AdUnit'}
									viewModeId={'newCampaignAdUnits'}
									sortProperties={SORT_PROPERTIES_ITEMS}
									filterProperties={FILTER_PROPERTIES_ITEMS}
									noActions
								/>)
								: 
								(<Grid 				
									container
									direction="column"
									alignItems="center"
								>
									<p>{t('ERR_CAMPAIGN_REQUIRES_UNITS')}</p>
									<NewUnitDialog
										variant='extended'
										color='secondary'
										btnLabel='NEW_UNIT'
									/>
								</Grid>)
							}
						</ContentBody>
					</Grid>
				</Grid>
			</div>
		)
	}
}

CampaignUnits.propTypes = {
	newItem: PropTypes.object.isRequired,
	title: PropTypes.string,
	descriptionHelperTxt: PropTypes.string,
	nameHelperTxt: PropTypes.string,
	adUnits: PropTypes.object.isRequired,
	adUnitsArray: PropTypes.array.isRequired
}

const NewCampaignUnits = NewCampaignHoc(CampaignUnits)

export default Translate(NewCampaignUnits)
