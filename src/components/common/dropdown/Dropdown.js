import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import {
	TextField,
	ListSubheader,
	InputLabel,
	MenuItem,
	FormHelperText,
	FormControl,
	Select,
} from '@material-ui/core'
import { InputLoading } from 'components/common/spinners/'
import classnames from 'classnames'
import { t } from 'selectors'

export const styles = theme => ({
	formControl: {
		minWidth: 120,
	},
	groupHeader: {
		backgroundColor: theme.palette.background.paper,
	},
	menuItem: {
		whiteSpace: 'break-spaces',
		wordBreak: 'break-word',
	},
})

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
								<ListSubheader
									className={classes.groupHeader}
									key={src.group.name || src.group}
								>
									{src.group.name || src.group}
								</ListSubheader>
							) : (
								<MenuItem
									className={classes.menuItem}
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
