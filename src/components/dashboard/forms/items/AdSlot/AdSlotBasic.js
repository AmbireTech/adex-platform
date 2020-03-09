import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Dropdown from 'components/common/dropdown'
import { FullContentSpinner } from 'components/common/dialog/content'
import {
	t,
	selectMainToken,
	selectNewAdSlot,
	selectValidationsById,
	selectSpinnerById,
	selectSlotTypesSourceWithDemands,
} from 'selectors'
import { UPDATING_SLOTS_DEMAND } from 'constants/spinners'
import {
	updateSlotsDemandThrottled,
	validateNumberString,
	updateNewSlot,
	execute,
} from 'actions'

function AdSlotBasic({ validateId }) {
	const newItem = useSelector(selectNewAdSlot)
	const adTypesSource = useSelector(selectSlotTypesSourceWithDemands)
	const {
		title = '',
		description = '',
		website = '',
		type = '',
		minPerImpression = '',
	} = newItem

	const spinner = useSelector(state =>
		selectSpinnerById(state, UPDATING_SLOTS_DEMAND)
	)

	const invalidFields = useSelector(
		state => selectValidationsById(state, validateId) || {}
	)

	useEffect(() => {
		execute(updateSlotsDemandThrottled())
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const {
		title: errTitle,
		description: errDescription,
		website: errWebsite,
		type: errType,
		minPerImpression: errMin,
	} = invalidFields

	const { symbol } = selectMainToken

	return (
		<div>
			{spinner ? (
				<FullContentSpinner />
			) : (
				<Grid container spacing={2}>
					<Grid item sm={12}>
						<TextField
							fullWidth
							type='text'
							required
							label={'Ad Slot ' + t('title', { isProp: true })}
							name='name'
							value={title}
							onChange={ev => execute(updateNewSlot('title', ev.target.value))}
							error={errTitle && !!errTitle.dirty}
							maxLength={120}
							helperText={
								errTitle && !!errTitle.dirty
									? errTitle.errMsg
									: t('TITLE_HELPER')
							}
						/>
					</Grid>
					<Grid item sm={12}>
						<TextField
							fullWidth
							type='text'
							multiline
							rows={3}
							label={t('description', { isProp: true })}
							value={description}
							onChange={ev =>
								execute(updateNewSlot('description', ev.target.value))
							}
							error={errDescription && !!errDescription.dirty}
							maxLength={300}
							helperText={
								errDescription && !!errDescription.dirty
									? errDescription.errMsg
									: t('DESCRIPTION_HELPER')
							}
						/>
					</Grid>
					<Grid item sm={12}>
						<TextField
							fullWidth
							type='text'
							required
							label={t('SLOT_WEBSITE')}
							name='website'
							value={website}
							onChange={ev =>
								execute(updateNewSlot('website', ev.target.value))
							}
							error={errWebsite && !!errWebsite.dirty}
							maxLength={120}
							helperText={
								errWebsite && !!errWebsite.dirty ? (
									errWebsite.errMsg
								) : (
									<span
										dangerouslySetInnerHTML={{
											__html: t('SLOT_WEBSITE_CODE_WARNING'),
										}}
									/>
								)
							}
						/>
					</Grid>
					<Grid item sm={12} md={12}>
						<Dropdown
							fullWidth
							required
							onChange={value => execute(updateNewSlot('type', value))}
							source={adTypesSource}
							value={type + ''}
							label={t('adType', { isProp: true })}
							htmlId='ad-type-dd'
							name='adType'
							error={errType && !!errType.dirty}
							maxLength={300}
							helperText={
								errType && !!errType.dirty
									? errType.errMsg
									: t('SLOT_TYPE_HELPER')
							}
						/>
					</Grid>
					<Grid item sm={12} md={12}>
						<TextField
							fullWidth
							type='text'
							required
							label={t('MIN_CPM_SLOT_LABEL', { args: [symbol] })}
							name='minPerImpression'
							value={minPerImpression || ''}
							onChange={ev => {
								const value = ev.target.value
								execute(updateNewSlot('minPerImpression', value))
								execute(
									validateNumberString({
										validateId,
										prop: 'minPerImpression',
										value,
										dirty: true,
									})
								)
							}}
							error={errMin && !!errMin.dirty}
							maxLength={120}
							helperText={
								errMin && !!errMin.dirty
									? errMin.errMsg
									: t('SLOT_MIN_CPM_HELPER')
							}
						/>
					</Grid>
				</Grid>
			)}
		</div>
	)
}

AdSlotBasic.propTypes = {
	validateId: PropTypes.string.isRequired,
}

export default AdSlotBasic
