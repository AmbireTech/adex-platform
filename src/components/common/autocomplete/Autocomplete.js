import React, { useEffect, Fragment, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import {
	FormHelperText,
	TextField,
	Box,
	Tooltip,
	Typography,
	Chip,
} from '@material-ui/core'
import AutocompleteMUI, {
	createFilterOptions,
} from '@material-ui/lab/Autocomplete'
import { CheckSharp, ErrorSharp, InfoSharp } from '@material-ui/icons'

const StatusIcon = {
	success: <CheckSharp color='secondary' />,
	error: <ErrorSharp color='error' />,
}

const useStyles = makeStyles(theme => ({
	extraInfo: {
		marginLeft: theme.spacing(1),
	},
}))

const ExtraLabel = ({ label }) =>
	Array.isArray(label) ? (
		<Fragment>
			{label.map((x, index) => (
				<Typography
					key={index}
					display='block'
					variant='caption'
					color='inherit'
				>
					{x}
				</Typography>
			))}
		</Fragment>
	) : (
		label
	)

function Autocomplete({
	source,
	multiple,
	label,
	variant,
	error,
	errorText,
	onInit,
	value,
	onChange,
	fullWidth,
	disabled,
	hideSelectedOnDisable,
	disableCloseOnSelect,
	disabledSrcValues = [],
	enableCreate,
}) {
	const classes = useStyles()

	useEffect(() => {
		typeof onInit === 'function' && onInit()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleChange = item => {
		if (multiple) {
			onChange(item.map(i => i.value || i.label || i))
		} else {
			onChange(item ? item.value || item.label || item : item)
		}
	}

	const srcValue = multiple
		? Array.isArray(value)
			? value.map(v => source.find(s => s.value === v) || '')
			: []
		: source.find(s => s.value === value) || value

	return (
		<Fragment>
			<AutocompleteMUI
				multiple={multiple}
				disableCloseOnSelect={disableCloseOnSelect}
				options={source}
				disabled={disabled}
				groupBy={option => option.group}
				value={srcValue}
				getOptionLabel={option => option.label || option.name || option}
				getLimitTagsText={more => `${more} more`}
				limitTags={10}
				getOptionDisabled={option =>
					disabledSrcValues.some(x => (option.value || option) === x)
				}
				getOptionSelected={(opt, val = '') => {
					const isSelected =
						!!opt &&
						!!val &&
						[JSON.stringify(val), val, val.value].includes(opt.value)
					return isSelected
				}}
				// freeSolo
				onChange={(_, newValue) => handleChange(newValue)}
				renderInput={params => {
					return (
						<TextField
							{...params}
							label={label}
							variant={variant}
							fullWidth={fullWidth}
							error={error}
						/>
					)
				}}
				renderOption={option => (
					<Box
						key={option.label}
						display='flex'
						flexDirection='row'
						alignItems='center'
					>
						<Typography display='inline'>{option.label}</Typography>
						{!!option.extraLabel && (
							<Tooltip arrow title={<ExtraLabel label={option.extraLabel} />}>
								<InfoSharp
									className={classes.extraInfo}
									fontSize='small'
									color='primary'
								/>
							</Tooltip>
						)}
					</Box>
				)}
				renderTags={(value, getCustomizedTagProps) =>
					value.map(
						(option, index) =>
							!(disabled && hideSelectedOnDisable) &&
							(!!option.extraLabel ? (
								<Tooltip
									arrow
									key={option.value + '' + index}
									title={<ExtraLabel label={option.extraLabel || ''} />}
								>
									<Chip
										label={option.label || option}
										{...getCustomizedTagProps({ index })}
									/>
								</Tooltip>
							) : (
								<Chip
									label={option.label || option}
									{...getCustomizedTagProps({ index })}
								/>
							))
					)
				}
			/>
			{error && (
				<FormHelperText error id='component-error-text'>
					{errorText}
				</FormHelperText>
			)}
		</Fragment>
	)
}

const filter = createFilterOptions()

export const AutocompleteWithCreate = ({
	source,
	label,
	variant,
	error,
	helperText,
	fullWidth,
	initialValue,
	disabled,
	onChange,
	changeOnInputUpdate,
}) => {
	const [value, setValue] = useState(null)

	useEffect(() => {
		setValue({ label: initialValue, value: initialValue })
	}, [initialValue])

	return (
		<AutocompleteMUI
			value={value}
			onChange={(event, newValue) => {
				// Create a new value from the user input
				if (newValue && (newValue.inputValue || newValue.value)) {
					const value = newValue.inputValue || newValue.value
					setValue({
						label: newValue.label || value,
						value,
					})
					onChange(value)
				} else {
					setValue(newValue)
					onChange('')
				}
			}}
			onInputChange={(ev, value) => {
				if (changeOnInputUpdate) {
					onChange(value)
				}
			}}
			filterOptions={(options, params) => {
				const filtered = filter(options, params)

				// Suggest the creation of a new value
				if (!changeOnInputUpdate && params.inputValue !== '') {
					filtered.push({
						inputValue: params.inputValue,
						label: `Add "${params.inputValue}"`,
					})
				}

				return filtered
			}}
			selectOnFocus
			// clearOnBlur
			// handleHomeEndKeys
			disabled={disabled}
			options={source}
			getLimitTagsText={more => `${more} more`}
			limitTags={2}
			groupBy={option => option.group}
			getOptionLabel={option => {
				// Value selected with enter, right from the input
				if (typeof option === 'string') {
					return option
				}
				// Add "xxx" option created dynamically
				if (option.inputValue) {
					return option.inputValue
				}
				// Regular option
				return option.label
			}}
			renderOption={option =>
				option.status ? (
					<Box
						display='flex'
						justifyContent='space-between'
						flexDirection='row'
						alignItems='center'
						width={1}
					>
						{option.label}

						{StatusIcon[option.status] || option.status}
					</Box>
				) : (
					option.label
				)
			}
			freeSolo={!changeOnInputUpdate}
			renderInput={params => (
				<TextField
					{...params}
					error={error}
					fullWidth={fullWidth}
					label={label}
					helperText={helperText}
					variant={variant}
				/>
			)}
		/>
	)
}

Autocomplete.propTypes = {
	source: PropTypes.array.isRequired,
	label: PropTypes.string.isRequired,
	onChange: PropTypes.func.isRequired,
	multiple: PropTypes.bool,
	variant: PropTypes.string,
}

export default Autocomplete
