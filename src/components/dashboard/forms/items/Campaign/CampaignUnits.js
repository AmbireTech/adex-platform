import React from 'react'
import { useSelector } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import { ContentBody } from 'components/common/dialog/content'
import EnhancedTable from 'components/dashboard/containers/Tables/EnhancedTable'
import { NewUnitDialog } from 'components/dashboard/forms/items/NewItems'
import { t, selectAdUnitsArray, selectAdUnits } from 'selectors'
import { updateNewCampaign, execute } from 'actions'

function CampaignUnits(props) {
	const adUnits = useSelector(selectAdUnits)
	const adUnitsArray = useSelector(selectAdUnitsArray)
	const hasAdUnits = adUnitsArray && adUnitsArray.length

	const handleSelect = selected => {
		const units = Object.values(selected).map(value => {
			return adUnits[value]
		})

		execute(updateNewCampaign('adUnits', units))
	}

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
								validate={props.validate}
								handleSelect={handleSelect}
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

export default CampaignUnits
