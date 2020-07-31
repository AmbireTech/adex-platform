import React from 'react'
import { DateTimePicker as MuiDateTimePicker } from '@material-ui/pickers'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import IconButton from '@material-ui/core/IconButton'
import {
	DateRange,
	NavigateNextRounded,
	NavigateBeforeRounded,
	Update,
} from '@material-ui/icons'
import InputAdornment from '@material-ui/core/InputAdornment'
import utils from 'helpers/dateUtils'

const CalendarIconAdor = ({
	icon = <DateRange />,
	iconColor,
	onIconClick,
	onLiveClick,
	onNextClick,
}) => (
	<InputAdornment position='end'>
		{onNextClick && (
			<IconButton color={iconColor} onClick={onNextClick} size='small'>
				<NavigateNextRounded />
			</IconButton>
		)}
		<IconButton color={iconColor} onClick={onIconClick} size='small'>
			{icon}
		</IconButton>
		{onLiveClick && (
			<IconButton color={iconColor} onClick={onLiveClick} size='small'>
				<Update />
			</IconButton>
		)}
	</InputAdornment>
)

export function DateTimePicker({
	calendarIcon,
	icon,
	iconColor,
	onIconClick,
	onNextClick,
	onLiveClick,
	onBackClick,
	InputProps = {},
	roundHour,
	...rest
}) {
	const now = utils.date(Date.now())
	const date = roundHour ? utils.setMinutes(now, 0) : now
	return (
		<MuiDateTimePicker
			value={date}
			InputProps={{
				...InputProps,
				disabled: rest.disabled,
				endAdornment: calendarIcon ? (
					<CalendarIconAdor
						icon={icon}
						iconColor={iconColor}
						onIconClick={onIconClick}
						onNextClick={onNextClick}
						onLiveClick={onLiveClick}
					/>
				) : null,
				startAdornment: onBackClick ? (
					<InputAdornment position='start'>
						<IconButton color={iconColor} onClick={onBackClick} size='small'>
							<NavigateBeforeRounded />
						</IconButton>
					</InputAdornment>
				) : null,
			}}
			{...rest}
		/>
	)
}

export default DateTimePicker

const dateTimePickerStyled = ({
	classes,
	calendarIcon,
	icon,
	InputProps = {},
	...rest
}) => {
	return (
		<DateTimePicker
			InputLabelProps={{
				classes: {
					root: classes.datepickerContrastLabel,
				},
				FormLabelClasses: {
					root: classes.datepickerContrastLabel,
					focused: classes.datepickerContrastLabelFocused,
				},
			}}
			InputProps={{
				...InputProps,
				disabled: rest.disabled,
				classes: {
					root: classes.datepickerContrastInput,
					underline: classes.datepickerContrastUnderline,
				},
				endAdornment: calendarIcon ? <CalendarIconAdor icon={icon} /> : null,
			}}
			{...rest}
		/>
	)
}

export const DateTimePickerContrast = withStyles(styles)(dateTimePickerStyled)
