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
		label,
		variant,
		allowCreate,
		validateCreation,
		error,
		errorText,
		onInit,
		onChange,
		defaultValue,
	} = props
	const [inputValue, setInputValue] = useState('')

	const suggestions = getSuggestions(
		inputValue,
		source,
		allowCreate,
		validateCreation
	)
	useEffect(() => {
		typeof onInit === 'function' && onInit()
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
					onChange={(_, newValue) => handleChange(newValue)}
					onInputChange={(_, newValue) => setInputValue(newValue)}
					defaultValue={defaultValue}
					renderInput={params => {
						if (defaultValue) params.inputProps.value = defaultValue
						return (
							<TextField
								{...params}
								label={label}
								variant={variant}
								fullWidth
								error={error}
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
