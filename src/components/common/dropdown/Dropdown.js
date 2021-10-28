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
	Tooltip,
	Typography,
	Select,
	Avatar,
} from '@material-ui/core'
import { InfoSharp } from '@material-ui/icons'

import { InputLoading } from 'components/common/spinners/'
import clsx from 'clsx'
import { t } from 'selectors'

export const styles = theme => ({
	// formControl: {
	// 	minWidth: 120,
	// },
	groupHeader: {
		backgroundColor: theme.palette.background.paper,
	},
	menuItem: {
		whiteSpace: 'break-spaces',
		wordBreak: 'break-word',
	},
	extraInfo: {
		marginLeft: theme.spacing(1),
	},
	select: {
		display: 'flex',
		alignItems: 'center',
	},
	labelImg: {
		height: theme.spacing(2),
		width: theme.spacing(2),
		marginRight: theme.spacing(2),
		backgroundColor: theme.palette.common.white,
	},
})

const useStyles = makeStyles(styles)

const ExtraLabel = ({ label }) =>
	Array.isArray(label) ? (
		<Fragment>
			{label.map((x, index) => (
				<Typography
					key={index}
					display='block'
					variant='caption'
					color='inherit'
				>
					{x}
				</Typography>
			))}
		</Fragment>
	) : (
		label
	)

function Dropdown(props) {
	const classes = useStyles()

	const {
		onChange,
		label = '',
		value,
		source = [],
		disabledValues = {},
		htmlId = 'some-id',
		disabled = false,
		error = false,
		helperText,
		fullWidth = false,
		className,
		selectClasses,
		required,
		loading,
		noSrcLabel,
		variant,
		IconComponent,
		inputComponent,
		size = 'medium',
	} = props

	const handleChange = event => {
		onChange(event.target.value)
	}

	// TODO: add native renderer for mobile devices when supported
	return (
		<Fragment>
			{!!source.length && !loading ? (
				<FormControl
					className={clsx(className, classes.formControl)}
					disabled={disabled}
					error={error}
					fullWidth={fullWidth}
					variant={variant}
					size={size}
				>
					<InputLabel htmlFor={htmlId} required={required}>
						{label}
					</InputLabel>
					<Select
						label={label}
						value={value ? value.id || value : value}
						onChange={handleChange}
						IconComponent={IconComponent}
						input={inputComponent}
						classes={{ selectMenu: classes.select, ...selectClasses }}
						MenuProps={{
							PaperProps: {
								square: true,
							},
						}}
					>
						{[...source].map(src => {
							const srcValue = src.value || {}
							const isDisabledSrc =
								!!disabledValues[srcValue.key] ||
								!!disabledValues[srcValue.id] ||
								!!disabledValues[src.value] ||
								src.disabled
							return src.group ? (
								<ListSubheader
									className={classes.groupHeader}
									key={src.group.name || src.group}
								>
									{src.group.name || src.group}
								</ListSubheader>
							) : (
								<MenuItem
									key={srcValue.key || srcValue.id || src.value}
									classes={{ selected: classes.menuItem }}
									value={srcValue.id || src.value}
									disabled={isDisabledSrc}
								>
									{!!src.iconSrc && 'icon'
									//TODO: icon
									}
									{!!src.imgSrc && (
										<Avatar
											src={src.imgSrc}
											alt={src.label}
											className={classes.labelImg}
										/>
									)}
									{src.label}
									{!!src.extraLabel && (
										<Tooltip
											arrow
											title={<ExtraLabel label={src.extraLabel} />}
										>
											<InfoSharp
												className={classes.extraInfo}
												fontSize='small'
												color='primary'
											/>
										</Tooltip>
									)}
								</MenuItem>
							)
						})}
					</Select>
					{helperText && <FormHelperText>{helperText}</FormHelperText>}
				</FormControl>
			) : (
				<>
					<TextField
						size={size}
						fullWidth={fullWidth}
						type='text'
						variant={variant}
						label={label}
						disabled
						value={loading ? t('LOADING_DATA') : noSrcLabel}
						helperText={loading ? null : helperText}
					/>
					{loading && <InputLoading />}
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
