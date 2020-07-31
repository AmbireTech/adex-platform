import React, { Component } from 'react'
import { DatePicker as MuiDatePicker } from '@material-ui/pickers'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import IconButton from '@material-ui/core/IconButton'
import {
	DateRangeSharp,
	NavigateNextRounded,
	NavigateBeforeRounded,
	Update,
} from '@material-ui/icons'
import InputAdornment from '@material-ui/core/InputAdornment'
import dateUtils, { makeJSDateObject } from 'helpers/dateUtils'
import clsx from 'clsx'

const CalendarIconAdor = ({
	icon = <DateRangeSharp />,
	iconColor,
	onIconClick,
	onNextClick,
	onLiveClick,
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

export class DatePicker extends Component {
	render() {
		const {
			calendarIcon,
			icon,
			iconColor,
			InputProps = {},
			onIconClick,
			onNextClick,
			onLiveClick,
			onBackClick,
			...rest
		} = this.props
		return (
			<MuiDatePicker
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
}

export default DatePicker

const datePickerStyled = ({
	classes,
	calendarIcon,
	icon,
	InputProps = {},
	...rest
}) => {
	return (
		<DatePicker
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

export const DatePickerContrast = withStyles(styles)(datePickerStyled)

const dayIsFuture = date => dateUtils.isAfter(date, dateUtils.date())

function PeriodSelectDatePicker({ classes, period, ...rest }) {
	const renderWrappedWeekDay = (date, selectedDate, dayInCurrentMonth) => {
		let dateClone = makeJSDateObject(date)
		let selectedDateClone = makeJSDateObject(selectedDate)

		const start = dateUtils.startOfDay(selectedDateClone)
		let end = dateUtils.date(start)

		switch (period) {
			case 'week':
				end = dateUtils.startOfDay(dateUtils.addDays(start, 6))
				maxDate = dateUtils.addDays(dateUtils.date(), -6)
				break
			case 'month':
				end = dateUtils.startOfDay(
					dateUtils.addDays(dateUtils.addMonths(start, 1), -1)
				)
				maxDate = dateUtils.addDays(dateUtils.addMonths(dateUtils.date(), 1), 1)

				break
			default:
				break
		}

		const dayIsBetween = dateUtils.isWithinInterval(dateClone, { start, end })
		const isFirstDay = dateUtils.isSameDay(dateClone, start)
		const isLastDay = dateUtils.isSameDay(dateClone, end)

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
				<IconButton className={dayClassName}>
					<span> {dateUtils.format(dateClone, 'D')} </span>
				</IconButton>
			</div>
		)
	}

	let maxDate = dateUtils.date()

	switch (period) {
		case 'week':
			maxDate = dateUtils.addDays(dateUtils.date(), -6)
			break
		case 'month':
			maxDate = dateUtils.addDays(dateUtils.addMonths(dateUtils.date(), -1), 1)

			break
		default:
			break
	}

	return (
		<DatePicker
			label='Week Picker'
			renderDay={renderWrappedWeekDay}
			shouldDisableDate={date => dayIsFuture(date)}
			views={['year', 'month', 'date']}
			maxDate={maxDate}
			{...rest}
		/>
	)
}

export const PeriodDatePicker = withStyles(styles)(PeriodSelectDatePicker)
