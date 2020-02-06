import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import Input from '@material-ui/core/Input'
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
		// margin = '',
		fullWidth = false,
		className,
		required,
		loading,
		noSrcLabel,
		variant,
		IconComponent,
	} = props

	const inputLabel = React.useRef(null)
	const [labelWidth, setLabelWidth] = React.useState(0)
	React.useEffect(() => {
		setLabelWidth(inputLabel.current.offsetWidth)
	}, [])

	const handleChange = event => {
		onChange(event.target.value)
	}

	// TODO: add native renderer for mobile devices when supported
	return (
		<FormControl
			className={classnames(className, classes.formControl)}
			disabled={disabled}
			error={error}
			fullWidth={fullWidth}
			variant={variant}
		>
			<InputLabel ref={inputLabel} htmlFor={htmlId} required={required}>
				{label}
			</InputLabel>
			{!!source.length && !loading ? (
				<Select
					value={value.id || value}
					onChange={handleChange}
					labelWidth={labelWidth}
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
			) : !loading ? (
				<Input disabled value={noSrcLabel} />
			) : (
				<>
					<Input disabled value={t('LOADING_DATA')} />
					<InputLoading />
				</>
			)}{' '}
			{helperText && <FormHelperText>{helperText}</FormHelperText>}
		</FormControl>
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
	IconComponent: PropTypes.element,
}

export default Dropdown
