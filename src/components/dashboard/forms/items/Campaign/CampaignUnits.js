import React from 'react'
import { useSelector } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import { AdUnitsTable } from 'components/dashboard/containers/Tables'
import { ContentBody } from 'components/common/dialog/content'
import { NewUnitDialog } from 'components/dashboard/forms/items/NewItems'
import {
	t,
	selectAdUnitsArray,
	selectAdUnits,
	selectNewCampaign,
} from 'selectors'
import { updateNewCampaign, execute } from 'actions'

function CampaignUnits(props) {
	const { temp } = useSelector(selectNewCampaign)
	const { selectedUnits } = temp
	const allAdUnits = useSelector(selectAdUnits)
	const allAdUnitsArray = useSelector(selectAdUnitsArray)
	const hasAdUnits = allAdUnitsArray && allAdUnitsArray.length

	const handleSelect = ({ selectedIndexes, selectedItemsIds } = {}) => {
		const units = Object.values(selectedItemsIds).map(value => {
			return allAdUnits[value]
		})

		const newTemp = { ...temp }
		newTemp.selectedUnits = selectedIndexes

		execute(updateNewCampaign('adUnits', units))
		execute(updateNewCampaign('temp', newTemp))
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
							<AdUnitsTable
								selected={selectedUnits}
								items={allAdUnitsArray}
								validate={props.validate}
								handleSelect={handleSelect}
								noClone
								noDownload
								rowSelectable
								noPrint
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
