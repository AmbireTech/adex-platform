import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NewCampaignHoc from './NewCampaignHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import { ContentBody } from 'components/common/dialog/content'
import EnhancedTable from 'components/dashboard/containers/Tables/EnhancedTable'
import { NewUnitDialog } from 'components/dashboard/forms/items/NewItems'

class CampaignUnits extends Component {
	handleSelect = selected => {
		const { adUnits, handleChange } = this.props
		const units = Object.values(selected).map(value => {
			return adUnits[value]
		})

		handleChange('adUnits', units)
	}

	render() {
		const { adUnitsArray, t } = this.props
		const hasAdUnits = adUnitsArray && adUnitsArray.length
		return (
			<div>
				<Grid
					container
					spacing={2}
					direction={hasAdUnits ? null : 'column'}
					alignItems={hasAdUnits ? null : 'center'}
				>
					<Grid item sm={12}>
						<ContentBody>
							{hasAdUnits ? (
								<EnhancedTable
									itemType={'AdUnit'}
									items={adUnitsArray}
									validate={this.props.validate}
									handleSelect={this.handleSelect}
									noActions
								/>
							) : (
								<Grid container direction='column' alignItems='center'>
									<p>{t('ERR_CAMPAIGN_REQUIRES_UNITS')}</p>
									<NewUnitDialog
										variant='extended'
										color='secondary'
										btnLabel='NEW_UNIT'
									/>
								</Grid>
							)}
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
	adUnitsArray: PropTypes.array.isRequired,
}

const NewCampaignUnits = NewCampaignHoc(CampaignUnits)

export default Translate(NewCampaignUnits)
