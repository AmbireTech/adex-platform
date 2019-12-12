import React, { useState } from 'react'
// import { PublisherStatistics } from 'components/dashboard/charts/revenue'
import DateRangeIcon from '@material-ui/icons/DateRange'
import { makeStyles } from '@material-ui/core/styles'
import { DateRangePicker } from '@matharumanpreet00/react-daterange-picker'
import { Popover, Chip } from '@material-ui/core'
import { formatDateTime } from 'helpers/formatters'
import { PropTypes } from 'prop-types'

const DATE_FORMAT = 'YYYY-MM-DD'

const useStyles = makeStyles(theme => ({
	root: {
		display: 'flex',
	},
	formControl: {
		margin: theme.spacing(3),
	},
	chip: {
		margin: theme.spacing(1),
	},
}))

export default function ChipDateRangePicker(props) {
	const [anchorDatePicker, setAnchorDatePicker] = useState(null)
	const { dateRange, setDateRange, minDate } = props
	const classes = useStyles()
	return (
		<React.Fragment>
			<Chip
				label={
					dateRange.startDate && dateRange.endDate
						? `${formatDateTime(
								dateRange.startDate,
								DATE_FORMAT
						  )} to ${formatDateTime(dateRange.endDate, DATE_FORMAT)}`
						: 'Choose Date Range'
				}
				onClick={e => setAnchorDatePicker(e.currentTarget)}
				icon={<DateRangeIcon />}
				className={classes.chip}
			/>
			<Popover
				id={'daterange-picker'}
				open={Boolean(anchorDatePicker)}
				anchorEl={anchorDatePicker}
				onClose={e => setAnchorDatePicker(null)}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'left',
				}}
			>
				<DateRangePicker
					initialDateRange={dateRange}
					minDate={minDate}
					maxDate={Date.now()}
					open={Boolean(setAnchorDatePicker)}
					onChange={range => setDateRange(range)}
				/>
			</Popover>
		</React.Fragment>
	)
}

ChipDateRangePicker.propTypes = {
	dateRange: PropTypes.object.isRequired,
	setDateRange: PropTypes.object.isRequired,
}
