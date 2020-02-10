import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { TextField } from '@material-ui/core'
import debounce from 'lodash.debounce'

function TextFieldDebounced(props) {
	const { debounceChange: dChange, ...rest } = props
	const [value, setValue] = useState(props.value)
	const debounceChange = useCallback(
		debounce(newValue => dChange(newValue), 1000),
		[]
	)

	const handleChange = e => {
		const val = e.target.value
		setValue(val)
		debounceChange(val)
	}
	return <TextField value={value} onChange={handleChange} {...rest} />
}

TextFieldDebounced.propTypes = {
	debounceChange: PropTypes.func.isRequired,
	value: PropTypes.string.isRequired,
}

export default TextFieldDebounced
