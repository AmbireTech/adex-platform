import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import classnames from 'classnames'
import { styles } from './styles'

class Dropdown extends React.Component {

    handleChange = event => {
    	this.props.onChange(event.target.value)
    }

    render() {
    	const {
    		classes,
    		label = '',
    		value,
    		source,
    		htmlId = 'some-id',
    		name = '',
    		disabled = false,
    		error = false,
    		helperText,
    		// margin = '',
    		fullWidth = false,
    		className,
    		required

    	} = this.props

    	// TODO: add native renderer for mobile devices when supported
    	return (
    		<FormControl
    			className={classnames(className, classes.formControl)}
    			disabled={disabled}
    			error={error}
    			fullWidth={fullWidth}
    		>
    			<InputLabel htmlFor={htmlId} required={required}>{label}</InputLabel>
    			<Select
    				value={value}
    				onChange={this.handleChange}
    				input={<Input name={name} id={htmlId} />}
    			>

    				{[...source].map((src) => {
    					return (
    						<MenuItem
    							key={src.value.key || src.value}
    							value={src.value}
    						>
    							{src.label}
    						</MenuItem>
    					)
    				})}
    			</Select>
    			{helperText &&
                    <FormHelperText>{helperText}</FormHelperText>
    			}
    		</FormControl>
    	)
    }
}

Dropdown.propTypes = {
	classes: PropTypes.object.isRequired,
	label: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	value: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.bool]),
	source: PropTypes.array.isRequired, //([{label: 'some label', value: 'some value'}])
	disabled: PropTypes.bool,
	error: PropTypes.bool,
	htmlId: PropTypes.string.isRequired,
	name: PropTypes.string,
	displayEmpty: PropTypes.bool,
	helperText: PropTypes.string
}

export default withStyles(styles)(Dropdown)