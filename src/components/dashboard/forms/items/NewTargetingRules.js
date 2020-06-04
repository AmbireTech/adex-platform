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
} from '@material-ui/icons'
import Autocomplete from 'components/common/autocomplete'

import { t, selectNewItemByTypeAndId } from 'selectors'
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
			return [...all, ...(target[a.type] || [])]
		}, [])
		.filter((x, i, all) => all.indexOf(x) === i)

	return currentSelectedValues
}

const Targets = ({
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
									})}
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

const NewItemTargeting = ({ itemType, itemId, sourcesSelector }) => {
	const [tabIndex, setTabIndex] = useState(0)
	const SOURCES = useSelector(sourcesSelector)
	const classes = useStyles()
	const { parameter, singleValuesSrc, actions, applyType } =
		SOURCES[tabIndex] || {}

	const source = useSelector(state =>
		singleValuesSrc
			? singleValuesSrc(state, [
					'legacy_300x250',
					'legacy_88x31',
					'legacy_234x60',
					'legacy_300x100',
					'legacy_120x60',
			  ])
			: []
	)

	const { audienceInput } = useSelector(state =>
		selectNewItemByTypeAndId(state, itemType, itemId)
	)
	const { inputs = {} } = audienceInput

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
								icon={parameterIcon[parameter]}
							/>
						))}
					</Tabs>
				</Paper>
				<Box mt={2}>
					<Targets
						target={inputs[parameter]}
						key={parameter}
						parameter={parameter}
						label={t(parameter)}
						placeholder={t(parameter)}
						source={source || []}
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

NewItemTargeting.propTypes = {
	title: PropTypes.string,
}

export default NewItemTargeting
