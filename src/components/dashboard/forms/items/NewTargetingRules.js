import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import {
	Grid,
	Box,
	Typography,
	TextField,
	Paper,
	Tab,
	Tabs,
} from '@material-ui/core'
import { Add as AddIcon } from '@material-ui/icons'
import Autocomplete from 'components/common/autocomplete'
import Dropdown from 'components/common/dropdown'

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

const ruleActions = [
	{
		value: 'in',
		label: 'SHOW_ONLY',
	},
	{
		value: 'nin',
		label: 'DO_NOT_SHOW',
	},
]

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
	itemId,
	itemType,
}) => {
	const id = `target-${index}`
	return (
		<Grid container spacing={2} alignItems='center'>
			<Grid item xs={12} md={8}>
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
				)}
			</Grid>
			<Grid item xs={12} md={4}>
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
							onChange={action => {
								execute(
									updateTargetRuleInput({
										index,
										itemType,
										itemId,
										parameter,
										target: { ...target, action },
										collection,
									})
								)
							}}
							source={ruleActions}
							value={target.action || ruleActions[0].value}
							label={t('TARGET_ACTION')}
							htmlId='ad-type-dd'
							name='adType'
							IconComponent={AddIcon}
						/>
					</Box>
				</Box>
			</Grid>
		</Grid>
	)
}

const NewItemTargeting = ({ itemType, itemId, sourcesSelector }) => {
	const [tabIndex, setTabIndex] = useState(0)
	const SOURCES = useSelector(sourcesSelector)
	const classes = useStyles()
	const { parameter, src } = SOURCES[tabIndex]

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
						{SOURCES.map(({ parameter, src }, index) => (
							<Tab key={parameter} label={parameter} />
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
						source={src || []}
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
