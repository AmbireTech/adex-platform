import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { TextField } from '@material-ui/core'
import debounce from 'lodash.debounce'

function TextFieldDebounced({ debounceChange, value, ...rest }) {
	const [innerValue, setInnerValue] = useState(value)
	const dChange = useCallback(
		debounce(newValue => debounceChange(newValue), 1000),
		[]
	)

	const handleChange = e => {
		const val = e.target.value
		setInnerValue(val)
		dChange(val)
	}
	return <TextField value={innerValue} onChange={handleChange} {...rest} />
}

TextFieldDebounced.propTypes = {
	debounceChange: PropTypes.func.isRequired,
	value: PropTypes.string.isRequired,
}

export default TextFieldDebounced
