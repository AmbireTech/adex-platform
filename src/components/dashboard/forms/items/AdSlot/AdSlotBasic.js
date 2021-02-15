import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import {
	Grid,
	TextField,
	FormGroup,
	FormControlLabel,
	FormControl,
	Checkbox,
	Accordion,
	AccordionSummary,
	Typography,
	Box,
} from '@material-ui/core'
import { ExpandMoreSharp as ExpandMoreIcon } from '@material-ui/icons'
import Dropdown from 'components/common/dropdown'
import { FullContentSpinner } from 'components/common/dialog/content'
import { AutocompleteWithCreate } from 'components/common/autocomplete'
import OutlinedPropView from 'components/common/OutlinedPropView'
import {
	t,
	selectNewAdSlot,
	selectValidationsById,
	selectSpinnerById,
	selectSlotTypesSourceWithDemands,
	websitesAutocompleteSrc,
	selectMainToken,
	selectMinTargetingCpm,
} from 'selectors'
import { UPDATING_SLOTS_DEMAND } from 'constants/spinners'
import {
	updateSlotsDemandThrottled,
	updateNewSlot,
	validateNumberString,
	execute,
} from 'actions'

function AdSlotBasic({ validateId }) {
	const { symbol } = useSelector(selectMainToken)
	const newItem = useSelector(selectNewAdSlot)
	const websitesSrc = useSelector(websitesAutocompleteSrc)
	const adTypesSource = useSelector(selectSlotTypesSourceWithDemands)
	const minCPM = useSelector(selectMinTargetingCpm)
	const {
		title = '',
		description = '',
		website = '',
		type = '',
		rulesInput: slotRulesInput,
		minPerImpression,
	} = newItem

	const rulesInput = slotRulesInput || { version: '1', inputs: {} }

	const { allowAdultContent, autoSetMinCPM } = rulesInput.inputs

	const spinner = useSelector(state =>
		selectSpinnerById(state, UPDATING_SLOTS_DEMAND)
	)

	const {
		title: errTitle,
		description: errDescription,
		website: errWebsite,
		type: errType,
		minPerImpression: errMin,
	} = useSelector(state => selectValidationsById(state, validateId) || {})

	useEffect(() => {
		execute(updateSlotsDemandThrottled())
		// eslint-disable-next-line react-hooks/exhaustive-deps

		if (!autoSetMinCPM && minPerImpression === null) {
			execute(updateNewSlot('minPerImpression', minCPM.toFixed(2)))
		}
	}, [autoSetMinCPM, minCPM, minPerImpression])

	return (
		<div>
			{spinner ? (
				<FullContentSpinner />
			) : (
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<TextField
							fullWidth
							variant='outlined'
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
					<Grid item xs={12}>
						<TextField
							fullWidth
							variant='outlined'
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
					<Grid item xs={12}>
						<AutocompleteWithCreate
							changeOnInputUpdate
							initialValue={website}
							variant='outlined'
							source={websitesSrc}
							fullWidth
							label={t('SLOT_WEBSITE')}
							error={errWebsite && !!errWebsite.dirty}
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
							onChange={value => {
								execute(updateNewSlot('website', (value || '').trim()))
							}}
						/>
					</Grid>
					<Grid item xs={12}>
						<Dropdown
							fullWidth
							variant='outlined'
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
					<Grid item xs={12}>
						<Accordion square={true} variant='outlined'>
							<AccordionSummary
								expandIcon={<ExpandMoreIcon />}
								aria-controls='slot-rules-advanced'
								id='slot-rules-advanced'
							>
								<Typography>{t('SLOT_ADVANCED')}</Typography>
							</AccordionSummary>
							<Box p={1}>
								<Grid container spacing={2}>
									<Grid item xs={12}>
										<TextField
											fullWidth
											variant='outlined'
											type='text'
											required
											label={t('MIN_CPM_SLOT_LABEL', { args: [symbol] })}
											name='minPerImpression'
											value={minPerImpression || ''}
											disabled={!!autoSetMinCPM}
											onChange={ev => {
												const value = (ev.target.value || '').trim()
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
													: t('SLOT_MANUAL_CPM_MIN_HELPER')
											}
										/>
									</Grid>

									<Grid item xs={12}>
										<OutlinedPropView
											label={t('SLOT_AUTO_MIN_CPM_LABEL')}
											value={
												<FormControl>
													<FormGroup row>
														<FormControlLabel
															control={
																<Checkbox
																	checked={!!autoSetMinCPM}
																	onChange={ev =>
																		execute(
																			updateNewSlot('rulesInput', {
																				...rulesInput,
																				inputs: {
																					...rulesInput.inputs,
																					autoSetMinCPM: ev.target.checked,
																				},
																			})
																		)
																	}
																	value='autoSetMinCPM'
																/>
															}
															label={t('SLOT_AUTO_MIN_CPM_INFO_LABEL')}
														/>
													</FormGroup>
												</FormControl>
											}
										/>
									</Grid>
									<Grid item xs={12}>
										<OutlinedPropView
											label={t('SLOT_ALLOW_ADULT_CONTENT')}
											value={
												<FormControl>
													<FormGroup row>
														<FormControlLabel
															control={
																<Checkbox
																	checked={!!allowAdultContent}
																	onChange={ev =>
																		execute(
																			updateNewSlot('rulesInput', {
																				...rulesInput,
																				inputs: {
																					...rulesInput.inputs,
																					allowAdultContent: ev.target.checked,
																				},
																			})
																		)
																	}
																	value='allowAdultContent'
																/>
															}
															label={t('SLOT_ALLOW_ADULT_CONTENT_INFO')}
														/>
													</FormGroup>
												</FormControl>
											}
										/>
									</Grid>
								</Grid>
							</Box>
						</Accordion>
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
