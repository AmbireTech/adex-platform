import React, { Component, useState, useContext, PureComponent } from 'react'
import {
	DateTimePicker as MuiDateTimePicker,
	DatePicker as MuiDatePicker,
} from '@material-ui/pickers'
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
import utils, { makeJSDateObject } from 'helpers/dateUtils'
import clsx from 'clsx'
// EXTRACT
// this guy required only on the docs site to work with dynamic date library

const CalendarIconAdor = ({
	icon = <DateRange />,
	iconColor,
	onIconClick,
	onLiveClick,
	onNextClick,
}) => (
	<InputAdornment position='end'>
		<IconButton color={iconColor} onClick={onIconClick}>
			{icon}
		</IconButton>
		{onLiveClick && (
			<IconButton color={iconColor} onClick={onLiveClick}>
				<Update />
			</IconButton>
		)}
		{onNextClick && (
			<IconButton color={iconColor} onClick={onNextClick}>
				<NavigateNextRounded />
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
	roundHour,
	...rest
}) {
	const now = utils.date(Date.now())
	const date = roundHour ? utils.setMinutes(now, 0) : now
	return (
		<MuiDateTimePicker
			value={date}
			InputProps={{
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
						<IconButton color={iconColor} onClick={onBackClick}>
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
				},
			}}
			InputProps={{
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
