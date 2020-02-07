import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { TextField } from '@material-ui/core'
import debounce from 'lodash.debounce'

function TextFieldDebounced(props) {
	const [value, setValue] = useState(props.value)
	const debounceChange = useCallback(
		debounce(newValue => props.debounceChange(newValue), 1000),
		[]
	)

	const handleChange = e => {
		const val = e.target.value
		setValue(val)
		debounceChange(val)
	}
	return <TextField {...props} value={value} onChange={handleChange} />
}

TextFieldDebounced.propTypes = {
	debounceChange: PropTypes.func.isRequired,
	value: PropTypes.string.isRequired,
}

export default TextFieldDebounced
