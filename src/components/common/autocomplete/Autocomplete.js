import React, { useEffect, Fragment } from 'react'
import PropTypes from 'prop-types'
import FormHelperText from '@material-ui/core/FormHelperText'
import TextField from '@material-ui/core/TextField'
import { Autocomplete as AutocompleteMUI } from '@material-ui/lab'

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
}) {
	useEffect(() => {
		typeof onInit === 'function' && onInit()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const handleChange = item => {
		const selectedItem = item ? item.value || item.label : item
		onChange(selectedItem)
	}

	return (
		<Fragment>
			<AutocompleteMUI
				multiple={multiple}
				options={source}
				value={value || null}
				getOptionLabel={option => option.label || option}
				getOptionSelected={(a, b = '') => {
					return [JSON.stringify(b), b, b.value].includes(a.value)
				}}
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
			/>
			{error && (
				<FormHelperText error id='component-error-text'>
					{errorText}
				</FormHelperText>
			)}
		</Fragment>
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
