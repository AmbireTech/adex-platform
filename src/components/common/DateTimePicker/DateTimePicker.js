import React, { Component } from 'react'
import { DateTimePicker  as MuiDateTimePicker  } from 'material-ui-pickers'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import IconButton from '@material-ui/core/IconButton'
import CalendarIcon from '@material-ui/icons/DateRange'
import InputAdornment from '@material-ui/core/InputAdornment'

const CalendarIconAdor = ({ icon = <CalendarIcon />, iconColor, onIconClick }) =>
	<InputAdornment position="end">
		<IconButton
			color={iconColor}
			onClick={onIconClick}
		>
			{icon}
		</IconButton>
	</InputAdornment>

export class DateTimePicker extends Component {
	render() {
		const { calendarIcon, icon, iconColor, onIconClick, ...rest } = this.props
		return (
			<MuiDateTimePicker
				InputProps={{
					disabled: rest.disabled,
					endAdornment: calendarIcon
						? <CalendarIconAdor
							icon={icon}
							iconColor={iconColor}
							onIconClick={onIconClick}
						/>
						: null
				}}
				{...rest}
			/>
		)
	}
}

export default DateTimePicker

const dateTimePickerStyled = ({ classes, calendarIcon, icon, ...rest }) => {
	return (
		<DateTimePicker
			InputLabelProps={{
				classes: {
					root: classes.datepickerContrastLabel,
				},
				FormLabelClasses: {
					root: classes.datepickerContrastLabel,
					focused: classes.datepickerContrastLabelFocused,
				}
			}}
			InputProps={{
				disabled: rest.disabled,
				classes: {
					root: classes.datepickerContrastInput,
					underline: classes.datepickerContrastUnderline
				},
				endAdornment: calendarIcon ? <CalendarIconAdor icon={icon} /> : null
			}}
			{...rest}
		/>
	)
}

export const DateTimePickerContrast = withStyles(styles)(dateTimePickerStyled)