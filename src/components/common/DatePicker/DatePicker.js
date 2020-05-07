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
import utils, { makeJSDateObject } from 'helpers/dateUtils'
import clsx from 'clsx'

const CalendarIconAdor = ({
	icon = <DateRangeSharp />,
	iconColor,
	onIconClick,
	onNextClick,
	onLiveClick,
}) => (
	<InputAdornment position='end'>
		<IconButton color={iconColor} onClick={onIconClick} size='small'>
			{icon}
		</IconButton>
		{onLiveClick && (
			<IconButton color={iconColor} onClick={onLiveClick} size='small'>
				<Update />
			</IconButton>
		)}
		{onNextClick && (
			<IconButton color={iconColor} onClick={onNextClick} size='small'>
				<NavigateNextRounded />
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

function WeekSelectDatePicker({ classes, ...rest }) {
	const formatWeekSelectLabel = (date, invalidLabel) => {
		let dateClone = makeJSDateObject(date)

		return dateClone && utils.isValid(dateClone)
			? `${utils.format(dateClone, 'MMM DD "YY')} - ${utils.format(
					utils.addDays(dateClone, 6),
					'MMM DD "YY'
			  )}`
			: invalidLabel
	}

	const dayIsFuture = date => utils.isAfter(date, utils.date())

	const renderWrappedWeekDay = (date, selectedDate, dayInCurrentMonth) => {
		let dateClone = makeJSDateObject(date)
		let selectedDateClone = makeJSDateObject(selectedDate)

		const start = utils.startOfWeek(selectedDateClone)
		const end = utils.endOfWeek(selectedDateClone)

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
				<IconButton className={dayClassName}>
					<span> {utils.format(dateClone, 'D')} </span>
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
			{...rest}
		/>
	)
}

export const WeeklyDatePicker = withStyles(styles)(WeekSelectDatePicker)
