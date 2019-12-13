import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import classnames from 'classnames'
import ChipDateRangePicker from 'components/common/DatePicker/ChipDateRangePicker'
import ChipMultipleSelect from 'components/common/dropdown/ChipMultipleSelect'
import Chip from '@material-ui/core/Chip'
import FormControl from '@material-ui/core/FormControl'
import InputAdornment from '@material-ui/core/InputAdornment'
import Input from '@material-ui/core/Input'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import Toolbar from '@material-ui/core/Toolbar'
import SearchIcon from '@material-ui/icons/Search'
import ClearIcon from '@material-ui/icons/Clear'
import ArchiveIcon from '@material-ui/icons/Archive'
import { lighten, makeStyles } from '@material-ui/core/styles'
import { filterTags } from './tableConfig'

const useToolbarStyles = makeStyles(theme => ({
	root: {
		paddingLeft: theme.spacing(2),
		paddingRight: theme.spacing(1),
	},
	highlight:
		theme.palette.type === 'light'
			? {
					color: theme.palette.secondary.main,
					backgroundColor: lighten(theme.palette.secondary.light, 0.85),
			  }
			: {
					color: theme.palette.text.primary,
					backgroundColor: theme.palette.secondary.dark,
			  },
	title: {
		flex: '1 1 100%',
	},
}))

export default function EnhancedTableToolbar(props) {
	const classes = useToolbarStyles()
	const {
		numSelected,
		search,
		setSearch,
		dateRange,
		setDateRange,
		filters,
		setFilters,
		itemType,
	} = props
	const filterSide = itemType === 'Campaign' ? itemType : 'Other'
	const filtersTagsCount = Array.from(Object.values(filters)).filter(e => e)
		.length
	const filtersPresent =
		filtersTagsCount < filterTags[filterSide].length ||
		(dateRange.startDate && dateRange.endDate) ||
		search
	const initialFilterTags = {}
	filterTags[filterSide].map(n => (initialFilterTags[n.name] = true))
	return (
		<Toolbar
			className={clsx(classes.root, {
				[classes.highlight]: numSelected > 0,
			})}
		>
			{numSelected > 0 ? (
				<Typography
					className={classes.title}
					color='inherit'
					variant='subtitle1'
				>
					{numSelected} selected
				</Typography>
			) : (
				<FormControl className={classnames(classes.flexItem)}>
					<Input
						name='search'
						id='search'
						value={search}
						onChange={ev => setSearch(ev.target.value)}
						startAdornment={
							<InputAdornment position='start'>
								<SearchIcon />
							</InputAdornment>
						}
					/>
				</FormControl>
			)}

			{numSelected > 0 ? (
				<Tooltip title='Archive'>
					<IconButton aria-label='archive'>
						<ArchiveIcon />
					</IconButton>
				</Tooltip>
			) : (
				<React.Fragment>
					<Tooltip title='Filter list'>
						<ChipMultipleSelect
							items={filterTags[filterSide]}
							state={filters}
							setState={setFilters}
							label='Filter'
						/>
					</Tooltip>

					<Tooltip title='Select Date Range'>
						<ChipDateRangePicker
							dateRange={dateRange}
							setDateRange={setDateRange}
						/>
					</Tooltip>
					{filtersPresent && (
						<Chip
							label={'Clear All Filters'}
							onClick={() => {
								setSearch('')
								setFilters(initialFilterTags)
								setDateRange({})
							}}
							icon={<ClearIcon />}
							className={classes.chip}
							color='primary'
						/>
					)}
				</React.Fragment>
			)}
		</Toolbar>
	)
}

EnhancedTableToolbar.propTypes = {
	numSelected: PropTypes.number.isRequired,
}
