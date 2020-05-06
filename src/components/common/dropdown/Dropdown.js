import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { TextField } from '@material-ui/core'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import ListSubheader from '@material-ui/core/ListSubheader'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import { InputLoading } from 'components/common/spinners/'
import classnames from 'classnames'
import { styles } from './styles'
import { t } from 'selectors'

const useStyles = makeStyles(styles)

function Dropdown(props) {
	const classes = useStyles()

	const {
		onChange,
		label = '',
		value,
		source = [],
		htmlId = 'some-id',
		disabled = false,
		error = false,
		helperText,
		fullWidth = false,
		className,
		required,
		loading,
		noSrcLabel,
		variant,
		IconComponent,
	} = props

	const handleChange = event => {
		onChange(event.target.value)
	}

	// TODO: add native renderer for mobile devices when supported
	return (
		<Fragment>
			{!!source.length && !loading ? (
				<FormControl
					className={classnames(className, classes.formControl)}
					disabled={disabled}
					error={error}
					fullWidth={fullWidth}
					variant={variant}
				>
					<InputLabel htmlFor={htmlId} required={required}>
						{label}
					</InputLabel>
					<Select
						label={label}
						value={value.id || value}
						onChange={handleChange}
						IconComponent={IconComponent}
					>
						{[...source].map(src => {
							return src.group ? (
								<ListSubheader key={src.group.name || src.group}>
									{src.group.name || src.group}
								</ListSubheader>
							) : (
								<MenuItem
									key={src.value.key || src.value.id || src.value}
									value={src.value.id || src.value}
								>
									{src.label}
								</MenuItem>
							)
						})}
					</Select>
					{helperText && <FormHelperText>{helperText}</FormHelperText>}
				</FormControl>
			) : (
				<>
					<TextField
						fullWidth={fullWidth}
						type='text'
						variant={variant}
						disabled
						value={loading ? t('LOADING_DATA') : noSrcLabel}
						helperText={helperText}
					/>
					{!!loading && <InputLoading />}
				</>
			)}
		</Fragment>
	)
}

Dropdown.propTypes = {
	label: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	value: PropTypes.oneOfType([
		PropTypes.number,
		PropTypes.string,
		PropTypes.bool,
	]),
	source: PropTypes.array.isRequired, //([{label: 'some label', value: 'some value'}])
	disabled: PropTypes.bool,
	error: PropTypes.bool,
	htmlId: PropTypes.string.isRequired,
	displayEmpty: PropTypes.bool,
	helperText: PropTypes.string,
	IconComponent: PropTypes.elementType,
}

export default Dropdown
