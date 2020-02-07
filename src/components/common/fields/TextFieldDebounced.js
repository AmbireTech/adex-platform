import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { TextField } from '@material-ui/core'
import { execute } from 'actions'
import debounce from 'lodash.debounce'

function TextFieldDebounced(props) {
	const [value, setValue] = useState(props.value)
	const debounceChange = debounce(val => execute(props.action(val)), 1000)
	const handleChange = e => {
		const val = e.target.value
		setValue(val)
		if (props.item) {
			debounceChange({ [props.item]: val })
		} else {
			debounceChange(val)
		}
	}
	return <TextField {...props} value={value} onChange={handleChange} />
}

TextFieldDebounced.propTypes = {
	action: PropTypes.func.isRequired,
	value: PropTypes.string.isRequired,
}

export default TextFieldDebounced
