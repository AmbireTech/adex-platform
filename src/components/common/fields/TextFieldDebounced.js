import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { TextField } from '@material-ui/core'
import debounce from 'lodash.debounce'

function TextFieldDebounced(props) {
	const [value, setValue] = useState(props.value)
	const debounceChange = debounce(props.debounceChange, 1000, {
		leading: false,
		trailing: true,
	})
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
