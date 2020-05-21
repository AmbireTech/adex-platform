import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import {
	Grid,
	Slider,
	IconButton,
	Box,
	Typography,
	TextField,
} from '@material-ui/core'
import { Cancel as CancelIcon, Add as AddIcon } from '@material-ui/icons'
import Autocomplete from 'components/common/autocomplete'
import Dropdown from 'components/common/dropdown'

import { t, selectTargetingSources, selectNewItemByTypeAndId } from 'selectors'
import { execute, updateNewItemTarget } from 'actions'

const useStyles = makeStyles(theme => ({
	slider: {
		padding: '22px 0px',
	},
	markLabel: {
		top: '30px',
	},
}))

const marks = [
	{
		value: 5,
		label: 'Low',
	},
	{
		value: 50,
		label: 'Medium',
	},
	{
		value: 95,
		label: 'High',
	},
]

const targetFunctions = [
	{
		value: 'nin',
		label: 'TF_NIN',
	},
	{
		value: 'in',
		label: 'TF_IN',
	},
	{
		value: 'lt',
		label: 'TF_LD',
	},
]

const Targets = ({
	source = [],
	collection,
	placeholder,
	label,
	index,
	target,
	// classes,
	// invalidFields,
	itemId,
	itemType,
}) => {
	const id = `target-${index}`
	return (
		<Grid container spacing={2} alignItems='center'>
			<Grid item xs={12} md={6}>
				{source.length ? (
					<Autocomplete
						multiple
						id={id}
						fullWidth
						direction='auto'
						openOnClick
						required={true}
						// error={invalidFields[id] && invalidFields[id].dirty}
						// errorText={
						// 	invalidFields[id] && !!invalidFields[id].dirty
						// 		? invalidFields[id].errMsg
						// 		: null
						// }
						onChange={tag => {
							execute(
								updateNewItemTarget({
									index,
									itemType,
									itemId,
									target: { target: { ...target, tag } },
									collection,
								})
							)
						}}
						label={label}
						placeholder={placeholder}
						source={source}
						// value={target.tag}
						variant='outlined'
					/>
				) : (
					<TextField
						fullWidth
						variant='outlined'
						type='text'
						required
						name='name'
						value={target.tag}
						label={label}
						onChange={ev =>
							execute(
								updateNewItemTarget({
									index,
									itemType,
									itemId,
									target: { target: { ...target, tag: ev.target.value } },
									collection,
								})
							)
						}
						maxLength={120}
					/>
				)}
			</Grid>
			<Grid item xs={12} md={6}>
				<Box
					display='flex'
					flexDirection='row'
					flexWrap='wrap'
					alignItems='center'
				>
					<Box flexGrow={1}>
						<Dropdown
							variant='outlined'
							fullWidth
							onChange={score => {
								execute(
									updateNewItemTarget({
										index,
										itemType,
										itemId,
										target: { target: { ...target, score } },
										collection,
									})
								)
							}}
							source={[...targetFunctions]}
							value={''}
							label={t('TARGET_ACTION')}
							htmlId='ad-type-dd'
							name='adType'
							IconComponent={AddIcon}
						/>
					</Box>
					<Box p={1}>
						<IconButton
							onClick={() =>
								execute(
									updateNewItemTarget({
										index,
										itemType,
										itemId,
										target,
										collection,
										remove: true,
									})
								)
							}
						>
							<CancelIcon />
						</IconButton>
					</Box>
				</Box>
			</Grid>
		</Grid>
	)
}

const NewItemTargeting = ({ itemType, itemId, sourcesSelector }) => {
	const SOURCES = useSelector(sourcesSelector)
	const SourcesSelect = useSelector(() => selectTargetingSources(SOURCES))
	const classes = useStyles()

	const { temp } = useSelector(state =>
		selectNewItemByTypeAndId(state, itemType, itemId)
	)
	const { targets = [] } = temp

	return (
		<Grid container spacing={1}>
			<Grid item xs={12}>
				{[...targets].map(
					(
						{ source = '', collection, label, placeholder, target = {} } = {},
						index
					) => (
						<Targets
							key={`${collection}-${index}`}
							label={t(label)}
							placeholder={t(placeholder)}
							index={index}
							source={(SOURCES[source] || {}).src || []}
							itemId={itemId}
							collection={collection}
							target={target}
							itemType={itemType}
							classes={classes}
						/>
					)
				)}
			</Grid>
			<Grid item xs={12}>
				<Dropdown
					variant='outlined'
					fullWidth
					onChange={target => {
						execute(
							updateNewItemTarget({
								itemType,
								itemId,
								target,
								collection: target.collection,
							})
						)
					}}
					source={[...SourcesSelect]}
					value={''}
					label={t('NEW_TARGET')}
					htmlId='ad-type-dd'
					name='adType'
					IconComponent={AddIcon}
				/>
			</Grid>
		</Grid>
	)
}

NewItemTargeting.propTypes = {
	title: PropTypes.string,
}

export default NewItemTargeting
