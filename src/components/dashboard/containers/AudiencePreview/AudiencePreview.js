import React from 'react'
import PropTypes from 'prop-types'
import { constants, IabCategories } from 'adex-models'
import OutlinedPropView from 'components/common/OutlinedPropView'

import { t } from 'selectors'
import { Box, Chip, Tooltip } from '@material-ui/core'

const { CountryNames, CountryTiers } = constants

const AudiencePreview = ({ audienceInput = {}, title, subHeader }) => {
	const {
		location = {},
		categories = {},
		publishers = {},
		advanced = {},
	} = audienceInput

	return (
		<Box>
			<Box m={1}>
				{title && <OutlinedPropView label={t('TITLE')} value={title} />}
				{!!location.apply ? (
					<OutlinedPropView
						margin='dense'
						label={t(`LOCATION_${location.apply.toUpperCase()}`)}
						value={
							location.apply === 'allin' ? (
								<Chip
									variant='outlined'
									size='small'
									label={t('ALL_COUNTRIES')}
								/>
							) : (
								(location[location.apply] || []).map(x => (
									<Tooltip
										key={x}
										title={
											CountryTiers[x]
												? CountryTiers[x].countries.join(', ')
												: t(CountryNames[x] || x || '')
										}
									>
										<Chip variant='outlined' size='small' label={t(x || '')} />
									</Tooltip>
								))
							)
						}
					/>
				) : (
					<OutlinedPropView
						margin='dense'
						label={t(`LOCATION`)}
						value={t('NOT_SELECTED')}
					/>
				)}
			</Box>
			{!!categories.apply ? (
				categories.apply.map(apply => (
					<Box key={apply} m={1}>
						<OutlinedPropView
							margin='dense'
							label={t(`CATEGORIES_${(apply || '').toUpperCase()}`)}
							value={(categories[apply] || []).map(cat => (
								<Chip
									variant='outlined'
									size='small'
									label={t(
										IabCategories.wrbshrinkerWebsiteApiV3Categories[cat] || cat
									)}
								/>
							))}
						/>
					</Box>
				))
			) : (
				<Box m={1}>
					<OutlinedPropView
						margin='dense'
						label={t(`CATEGORIES`)}
						value={t('NOT_SELECTED')}
					/>
				</Box>
			)}

			<Box m={1}>
				{publishers.apply ? (
					<OutlinedPropView
						margin='dense'
						label={t(`PUBLISHERS_${publishers.apply.toUpperCase()}`)}
						value={
							publishers.apply === 'allin' ? (
								<Chip
									variant='outlined'
									size='small'
									label={t('ALL_PUBLISHERS')}
								/>
							) : (
								(publishers[publishers.apply] || []).map((x, index) => (
									<Chip
										key={index}
										variant='outlined'
										size='small'
										label={(JSON.parse(x) || {}).hostname}
									/>
								))
							)
						}
					/>
				) : (
					<OutlinedPropView
						margin='dense'
						label={t(`PUBLISHERS`)}
						value={t('NOT_SELECTED')}
					/>
				)}
			</Box>

			<Box m={1}>
				<OutlinedPropView
					margin='dense'
					label={t(`INCLUDE_INCENTIVIZED_TRAFFIC`)}
					value={t(advanced.includeIncentivized ? 'TRUE' : 'FALSE')}
				/>
			</Box>
			<Box m={1}>
				<OutlinedPropView
					margin='dense'
					label={t(`DISABLE_FREQUENCY_CAPPING`)}
					value={t(advanced.disableFrequencyCapping ? 'TRUE' : 'FALSE')}
				/>
			</Box>
			<Box m={1}>
				<OutlinedPropView
					margin='dense'
					label={t(`LIMIT_AVERAGE_DAILY_SPENDING`)}
					value={t(advanced.limitDailyAverageSpending ? 'TRUE' : 'FALSE')}
				/>
			</Box>
		</Box>
	)
}

AudiencePreview.propTypes = {
	audienceInput: PropTypes.object,
	subHeader: PropTypes.string,
}

export default AudiencePreview
