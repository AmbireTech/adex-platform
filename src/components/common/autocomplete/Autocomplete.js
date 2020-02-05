import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import FormHelperText from '@material-ui/core/FormHelperText'
import TextField from '@material-ui/core/TextField'
import { Autocomplete as AutocompleteMUI } from '@material-ui/lab'
import { getSuggestions } from './common'

function Autocomplete(props) {
	const {
		classes,
		source,
		multiple,
		value,
		label,
		variant,
		allowCreate,
		validateCreation,
		error,
		errorText,
		onInit,
		onChange,
	} = props
	const [inputValue, setInputValue] = useState('')

	const suggestions = getSuggestions(
		inputValue,
		source,
		allowCreate,
		validateCreation
	)
	useEffect(() => {
		onInit()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleChange = item => {
		const selectedItem = item ? item.value || item.label : item
		onChange(selectedItem)
	}

	return (
		<div>
			<div className={classes.container}>
				<AutocompleteMUI
					multiple={multiple}
					options={suggestions}
					getOptionLabel={option => option.label}
					onChange={(event, newValue) => handleChange(newValue)}
					style={{ width: 300 }}
					value={suggestions[0].label}
					onInputChange={(event, value) => setInputValue(value)}
					renderInput={params => {
						params.inputProps.value = value ? value : params.inputProps.value
						return (
							<TextField
								{...params}
								label={label}
								variant={variant}
								fullWidth
							/>
						)
					}}
				/>
				{error && (
					<FormHelperText error id='component-error-text'>
						{errorText}
					</FormHelperText>
				)}
			</div>
		</div>
	)
}

Autocomplete.propTypes = {
	classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(Autocomplete)
