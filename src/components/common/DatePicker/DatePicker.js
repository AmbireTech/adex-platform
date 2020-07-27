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
			onIconClick,
			onNextClick,
			onLiveClick,
			onBackClick,
			...rest
		} = this.props
		return (
			<MuiDatePicker
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

const datePickerStyled = ({ classes, calendarIcon, icon, ...rest }) => {
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

function PeriodSelectDatePicker({ classes, period, ...rest }) {
	const formatWeekSelectLabel = (date, invalidLabel) => {
		let dateClone = makeJSDateObject(date)

		return dateClone && dateUtils.isValid(dateClone)
			? `${dateUtils.format(dateClone, 'MMM DD "YY')} - ${dateUtils.format(
					dateUtils.addDays(dateClone, 7),
					'MMM DD "YY'
			  )}`
			: invalidLabel
	}

	const dayIsFuture = date => dateUtils.isAfter(date, dateUtils.date())

	const renderWrappedWeekDay = (date, selectedDate, dayInCurrentMonth) => {
		let dateClone = makeJSDateObject(date)
		let selectedDateClone = makeJSDateObject(selectedDate)

		const start = dateUtils.date(selectedDateClone).startOf('day')
		let end = dateUtils.date(start).endOf('day')

		switch (period) {
			case 'week':
				end = dateUtils.addDays(start, 6).endOf('day')
				break
			case 'month':
				end = dateUtils
					.addDays(dateUtils.addMonths(start, 1), -1)
					.startOf('day')
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

	return (
		<DatePicker
			label='Week Picker'
			renderDay={renderWrappedWeekDay}
			labelFunc={formatWeekSelectLabel}
			shouldDisableDate={date => dayIsFuture(date)}
			views={['year', 'month', 'date']}
			{...rest}
		/>
	)
}

export const PeriodDatePicker = withStyles(styles)(PeriodSelectDatePicker)
