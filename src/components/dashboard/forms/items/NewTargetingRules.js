import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import {
	Grid,
	Box,
	TextField,
	Paper,
	Tab,
	Tabs,
	FormControlLabel,
	FormControl,
	RadioGroup,
	Radio,
	FormLabel,
} from '@material-ui/core'
import {
	PublicSharp as LocationIcon,
	LocalOfferSharp as CategoryIcon,
	WebAssetSharp as PublisherIcon,
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
}))

const parameterIcon = {
	location: <LocationIcon />,
	categories: <CategoryIcon />,
	publishers: <PublisherIcon />,
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
	disabled,
}) =>
	source.length ? (
		<Autocomplete
			multiple
			id={id}
			fullWidth
			direction='auto'
			openOnClick
			required={true}
			disabled={disabled}
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
						target: { ...target, value },
						collection,
					})
				)
			}}
			label={label}
			placeholder={placeholder}
			source={source}
			value={target.value}
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
						target: { ...target, value: ev.target.value },
						collection,
					})
				)
			}
			maxLength={120}
		/>
	)

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
	actionsType,
	itemId,
	itemType,
}) => {
	const id = `target-${index}`
	const applyValue = target.apply || actions[0].type
	return (
		<Grid container spacing={2} alignItems='center'>
			<Grid item xs={12} md={12}>
				<RadioGroup
					aria-label={parameter}
					name={parameter}
					value={applyValue}
					onChange={ev =>
						execute(
							updateTargetRuleInput({
								index,
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
								control={<Radio />}
								value={a.type}
								label={a.label}
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
									itemType={itemType}
								/>
							)}
						</Box>
					))}
				</RadioGroup>
			</Grid>
		</Grid>
	)
}

const NewItemTargeting = ({ itemType, itemId, sourcesSelector }) => {
	const [tabIndex, setTabIndex] = useState(0)
	const SOURCES = useSelector(sourcesSelector)
	const classes = useStyles()
	const { parameter, singleValuesSrc, actions, actionsType } = SOURCES[tabIndex]

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
						source={singleValuesSrc || []}
						actions={actions}
						actionsType={actionsType}
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
