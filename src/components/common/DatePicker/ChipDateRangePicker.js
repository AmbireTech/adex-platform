import React, { useState } from 'react'
// import { PublisherStatistics } from 'components/dashboard/charts/revenue'
import DateRangeIcon from '@material-ui/icons/DateRange'
import { DateRangePicker } from '@matharumanpreet00/react-daterange-picker'
import { Popover, Chip } from '@material-ui/core'
import { formatDateTime } from 'helpers/formatters'
import { PropTypes } from 'prop-types'

export default function ChipDateRangePicker(dateRange, setDateRange, minDate) {
	const [anchorDatePicker, setAnchorDatePicker] = useState(null)

	return (
		<React.Fragment>
			<Chip
				label={
					dateRange.startDate && dateRange.endDate
						? `${formatDateTime(dateRange.startDate)} - ${formatDateTime(
								dateRange.endDate
						  )}`
						: 'Choose Date Range'
				}
				onClick={e => setAnchorDatePicker(e.currentTarget)}
				icon={<DateRangeIcon />}
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
					definedRanges={[]}
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
