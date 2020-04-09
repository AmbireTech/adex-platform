import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Slider from '@material-ui/core/Slider'
import IconButton from '@material-ui/core/IconButton'
import CancelIcon from '@material-ui/icons/Cancel'
import AddIcon from '@material-ui/icons/Add'
import Autocomplete from 'components/common/autocomplete'
import Typography from '@material-ui/core/Typography'
import Dropdown from 'components/common/dropdown'

import { t, selectTargetingSources, selectNewItemByType } from 'selectors'
import { execute, updateNewItemTargets } from 'actions'

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

const Targets = ({
	source = [],
	collection,
	placeholder,
	label,
	index,
	target,
	classes,
	invalidFields,
	itemType,
}) => {
	const id = `target-${index}`
	return (
		<Grid container spacing={2}>
			<Grid item xs={12} md={6}>
				<Autocomplete
					id={id}
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
							updateNewItemTargets({
								index,
								itemType,
								target: { target: { ...target, tag } },
								collection,
							})
						)
					}}
					label={label}
					placeholder={placeholder}
					source={source}
					value={target.tag}
					suggestionMatch='anywhere'
					showSuggestionsWhenValueIsSet={true}
					allowCreate={!source.length}
					variant='outlined'
				/>
			</Grid>
			<Grid item xs={11} md={5}>
				<div>
					<Typography id={`target-score-${index}`}>
						{/*TODO: Translate target name*/}
						{t('TARGET_SCORE_LABEL', {
							args: [target.score],
						})}
					</Typography>
					<Slider
						classes={{ root: classes.slider, markLabel: classes.markLabel }}
						aria-label={`target-score-${index}`}
						min={1}
						max={100}
						step={1}
						valueLabelDisplay='auto'
						disabled={!target.tag}
						value={target.score}
						marks={marks}
						onChange={(ev, score) =>
							execute(
								updateNewItemTargets({
									index,
									itemType,
									target: { target: { ...target, score } },
									collection,
								})
							)
						}
					/>
				</div>
			</Grid>
			<Grid item container xs={1} md={1} alignItems='center'>
				<IconButton
					onClick={() =>
						execute(
							updateNewItemTargets({
								index,
								itemType,
								target,
								collection,
								remove: true,
							})
						)
					}
				>
					<CancelIcon />
				</IconButton>
			</Grid>
		</Grid>
	)
}

const NewItemTargeting = ({ itemType, sourcesSelector }) => {
	const SOURCES = useSelector(sourcesSelector)
	const SourcesSelect = useSelector(() => selectTargetingSources(SOURCES))
	const classes = useStyles()

	const { temp } = useSelector(state => selectNewItemByType(state, itemType))
	const { targets = [] } = temp

	return (
		<div>
			<Grid container spacing={1}>
				<Grid item sm={12}>
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
								collection={collection}
								target={target}
								itemType={itemType}
								t={t}
								classes={classes}
							/>
						)
					)}
				</Grid>
				<Grid item sm={12}>
					<Dropdown
						variant='outlined'
						fullWidth
						onChange={target => {
							execute(
								updateNewItemTargets({
									itemType,
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
		</div>
	)
}

NewItemTargeting.propTypes = {
	title: PropTypes.string,
}

export default NewItemTargeting
