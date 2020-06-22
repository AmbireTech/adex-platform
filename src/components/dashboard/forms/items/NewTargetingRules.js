import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import {
	Grid,
	Box,
	TextField,
	Paper,
	Tab,
	Tabs,
	FormControlLabel,
	RadioGroup,
	Radio,
	Typography,
	Checkbox,
} from '@material-ui/core'
import {
	PublicSharp as LocationIcon,
	LocalOfferSharp as CategoryIcon,
	WebAssetSharp as PublisherIcon,
	MoreHorizSharp as AdvIcon,
	ErrorSharp as ErrIcon,
} from '@material-ui/icons'
import Autocomplete from 'components/common/autocomplete'

import {
	t,
	selectAudienceInputsDatByItem,
	selectNewItemByTypeAndId,
} from 'selectors'
import { execute, updateTargetRuleInput } from 'actions'

const useStyles = makeStyles(theme => ({
	slider: {
		padding: '22px 0px',
	},
	markLabel: {
		top: '30px',
	},
	disabled: {
		opacity: 0.5,
	},
	in: {
		color: theme.palette.success.main,
	},
	nin: {
		color: theme.palette.error.main,
	},
}))

const parameterIcon = {
	location: <LocationIcon />,
	categories: <CategoryIcon />,
	publishers: <PublisherIcon />,
	advanced: <AdvIcon />,
}

const getApply = (applyType, currentApply = [], actionType) =>
	applyType === 'single'
		? actionType
		: [...currentApply, actionType].filter((t, i, all) => all.indexOf(t) === i)

const getDisabledPublishersAfterCategoriesRules = ({
	selectedCategories,
	publishers,
}) => {
	console.log('selectedCategories', selectedCategories)
	console.log('publishers', publishers)
}

const getDisabledValues = ({
	target,
	actionType,
	parameter,
	inputs,
	SOURCES,
}) => {
	if (parameter === 'publishers') {
		return getDisabledPublishersAfterCategoriesRules({
			selectedCategories: inputs['categories'],
			actionType,
			publishers: SOURCES.find(x => x.parameter === 'publishers'),
		})
	}
}

const Sources = ({
	id,
	source = [],
	collection,
	placeholder,
	label,
	index,
	target = {},
	parameter,
	itemId,
	itemType,
	actionType,
	applyType,
	disabled,
	disabledSrcValues,
}) => {
	const apply = getApply(applyType, target.apply, actionType)

	return source.length ? (
		<Autocomplete
			multiple
			id={id}
			fullWidth
			direction='auto'
			openOnClick
			required={true}
			disabled={disabled}
			hideSelectedOnDisable
			disabledSrcValues={disabledSrcValues}
			disableCloseOnSelect
			// error={invalidFields[id] && invalidFields[id].dirty}
			// errorText={
			// 	invalidFields[id] && !!invalidFields[id].dirty
			// 		? invalidFields[id].errMsg
			// 		: null
			// }
			onChange={value => {
				execute(
					updateTargetRuleInput({
						index,
						itemType,
						itemId,
						parameter,
						target: {
							...target,
							...{ [actionType]: value, apply },
						},
						collection,
					})
				)
			}}
			label={label}
			placeholder={placeholder}
			source={source}
			value={target[actionType] || []}
			variant='outlined'
		/>
	) : (
		<TextField
			fullWidth
			variant='outlined'
			type='text'
			required
			disabled={disabled}
			name='name'
			value={target.value}
			label={label}
			onChange={ev =>
				execute(
					updateTargetRuleInput({
						index,
						itemType,
						itemId,
						parameter,
						target: { ...target, ...{ [actionType]: ev.target.value, apply } },
						collection,
					})
				)
			}
			maxLength={120}
		/>
	)
}

const getMultipleActionsUsedValues = ({ actions, currentAction, target }) => {
	const currentSelectedValues = actions
		.filter(a => a.type !== currentAction.type)
		.reduce((all, a) => {
			return [
				...all,
				...(target[a.type] || []),
				...(currentAction.disabledValues || []),
			]
		}, [])
		.filter((x, i, all) => all.indexOf(x) === i)

	return currentSelectedValues
}

const Targets = ({
	inputs,
	source = [],
	collection,
	placeholder,
	label,
	index,
	target = {},
	parameter,
	// classes,
	// invalidFields,
	actions,
	applyType,
	itemId,
	itemType,
	disabledValues,
	SOURCES,
}) => {
	const classes = useStyles()
	const id = `target-${index}`
	const applyValue = target.apply || actions[0].type

	return (
		<Grid container spacing={2} alignItems='center'>
			<Grid item xs={12} md={12}>
				{applyType === 'single' && (
					<RadioGroup
						aria-label={parameter}
						name={parameter}
						value={applyValue}
						onChange={ev =>
							execute(
								updateTargetRuleInput({
									itemType,
									itemId,
									parameter,
									target: { ...target, apply: ev.target.value },
									collection,
								})
							)
						}
					>
						{actions.map(a => (
							<Box key={parameter + a.type}>
								<FormControlLabel
									control={
										<Radio
											className={clsx({
												[classes.in]: ['in', 'allin'].includes(a.type),
												[classes.nin]: a.type === 'nin',
											})}
											color='default'
										/>
									}
									value={a.type}
									label={a.label}
									className={clsx({
										[classes.disabled]: a.type !== applyValue,
									})}
								/>

								{!!a.value ? (
									a.value
								) : (
									<Sources
										id={id}
										source={source}
										collection={collection}
										placeholder={placeholder}
										disabled={a.type !== applyValue}
										label={label}
										index={index}
										target={target}
										parameter={parameter}
										itemId={itemId}
										actionType={a.type}
										applyType={applyType}
										itemType={itemType}
										disabledSrcValues={disabledValues[a.type]}
									/>
								)}
							</Box>
						))}
					</RadioGroup>
				)}
				{applyType === 'multiple' &&
					actions.map(a => (
						<Box key={parameter + a.type}>
							<Typography
								className={clsx({
									[classes.in]: ['in', 'allin'].includes(a.type),
									[classes.nin]: a.type === 'nin',
								})}
							>
								{a.label}
							</Typography>
							{!!a.value ? (
								a.value
							) : (
								<Sources
									id={id}
									source={source}
									collection={collection}
									placeholder={placeholder}
									label={label}
									index={index}
									target={target}
									parameter={parameter}
									itemId={itemId}
									actionType={a.type}
									applyType={applyType}
									itemType={itemType}
									disabledSrcValues={getMultipleActionsUsedValues({
										actions,
										currentAction: a,
										target,
									}).concat(disabledValues[a.type] || [])}
								/>
							)}
						</Box>
					))}
				{applyType === 'multiple-checkbox' &&
					actions.map(a => (
						<Box key={parameter + a.value}>
							<FormControlLabel
								control={
									<Checkbox
										checked={!!target[a.value]}
										name={a.value}
										onChange={ev =>
											execute(
												updateTargetRuleInput({
													index,
													itemType,
													itemId,
													parameter,
													target: {
														...target,
														...{
															[a.value]: ev.target.checked,
														},
													},
													collection,
												})
											)
										}
									/>
								}
								label={a.label}
							/>
						</Box>
					))}
			</Grid>
		</Grid>
	)
}

const NewTargetingRules = ({ itemType, itemId, validateId }) => {
	const [tabIndex, setTabIndex] = useState(0)
	const classes = useStyles()

	const { SOURCES, inputs, errorParameters } = useSelector(state =>
		selectAudienceInputsDatByItem(state, itemType, itemId, validateId)
	)

	const { parameter, source, actions, applyType, disabledValues } =
		SOURCES[tabIndex] || {}

	return (
		<Grid container spacing={1}>
			<Grid item xs={12}>
				<Paper position='static' variant='outlined'>
					<Tabs
						value={tabIndex}
						onChange={(ev, index) => setTabIndex(index)}
						variant='scrollable'
						scrollButtons='auto'
						indicatorColor='primary'
						textColor='primary'
					>
						{SOURCES.map(({ parameter }, index) => (
							<Tab
								key={parameter}
								label={parameter}
								icon={
									errorParameters[parameter] ? (
										<ErrIcon color='error' />
									) : (
										parameterIcon[parameter]
									)
								}
							/>
						))}
					</Tabs>
				</Paper>
				<Box mt={2}>
					<Targets
						inputs={inputs}
						target={inputs[parameter]}
						key={parameter}
						parameter={parameter}
						label={t(parameter)}
						placeholder={t(parameter)}
						source={source || []}
						disabledValues={disabledValues || {}}
						SOURCES={SOURCES}
						actions={actions}
						applyType={applyType}
						itemId={itemId}
						itemType={itemType}
						classes={classes}
					/>
				</Box>
			</Grid>
		</Grid>
	)
}

NewTargetingRules.propTypes = {
	title: PropTypes.string,
}

export default NewTargetingRules
