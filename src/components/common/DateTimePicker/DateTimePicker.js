import React, { Component, useState, useContext, PureComponent } from 'react'
import {
	DateTimePicker as MuiDateTimePicker,
	DatePicker as MuiDatePicker,
} from '@material-ui/pickers'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import IconButton from '@material-ui/core/IconButton'
import CalendarIcon from '@material-ui/icons/DateRange'
import InputAdornment from '@material-ui/core/InputAdornment'
import utils, { makeJSDateObject } from 'helpers/dateUtils'
import clsx from 'clsx'
// EXTRACT
// this guy required only on the docs site to work with dynamic date library

const CalendarIconAdor = ({
	icon = <CalendarIcon />,
	iconColor,
	onIconClick,
}) => (
	<InputAdornment position='end'>
		<IconButton color={iconColor} onClick={onIconClick}>
			{icon}
		</IconButton>
	</InputAdornment>
)

export function DateTimePicker({
	calendarIcon,
	icon,
	iconColor,
	onIconClick,
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
					/>
				) : null,
			}}
			{...rest}
		/>
	)
}

export default DateTimePicker

export class DatePicker extends Component {
	render() {
		const { calendarIcon, icon, iconColor, onIconClick, ...rest } = this.props
		return (
			<MuiDatePicker
				InputProps={{
					disabled: rest.disabled,
					endAdornment: calendarIcon ? (
						<CalendarIconAdor
							icon={icon}
							iconColor={iconColor}
							onIconClick={onIconClick}
						/>
					) : null,
				}}
				{...rest}
			/>
		)
	}
}

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

function WeekSelectDatePicker({ classes, calendarIcon, icon, ...rest }) {
	const formatWeekSelectLabel = (date, invalidLabel) => {
		let dateClone = makeJSDateObject(date)

		return dateClone && utils.isValid(dateClone)
			? `${utils.format(dateClone, 'MMM Do, YYYY')} - ${utils.format(
					utils.addDays(dateClone, 6),
					'MMM Do, YYYY'
			  )}`
			: invalidLabel
	}

	const dayIsFuture = date =>
		utils.isAfter(date, utils.addDays(utils.date(), -6))

	const renderWrappedWeekDay = (date, selectedDate, dayInCurrentMonth) => {
		let dateClone = makeJSDateObject(date)
		let selectedDateClone = makeJSDateObject(selectedDate)

		const start = selectedDateClone
		const end = utils.addDays(selectedDateClone, 6)

		const dayIsBetween = utils.isWithinInterval(dateClone, { start, end })
		const isFirstDay = utils.isSameDay(dateClone, start)
		const isLastDay = utils.isSameDay(dateClone, end)

		const wrapperClassName = clsx({
			[classes.highlight]: dayIsBetween,
			[classes.firstHighlight]: isFirstDay,
			[classes.endHighlight]: isLastDay,
		})

		const dayClassName = clsx(classes.day, {
			[classes.nonCurrentMonthDay]: !dayInCurrentMonth,
			[classes.highlightNonCurrentMonthDay]: !dayInCurrentMonth && dayIsBetween,
			[classes.dayDisabled]: dayIsFuture(dateClone),
		})

		return (
			<div className={wrapperClassName}>
				<IconButton className={dayClassName} dayDisabled={dayIsFuture}>
					<span> {utils.format(dateClone, 'D')} </span>
				</IconButton>
			</div>
		)
	}

	return (
		<MuiDatePicker
			label='Week Picker'
			renderDay={renderWrappedWeekDay}
			labelFunc={formatWeekSelectLabel}
			shouldDisableDate={date => dayIsFuture(date)}
			InputProps={{
				endAdornment: calendarIcon ? <CalendarIconAdor icon={icon} /> : null,
			}}
			{...rest}
		/>
	)
}

export const WeeklyDatePicker = withStyles(styles)(WeekSelectDatePicker)
