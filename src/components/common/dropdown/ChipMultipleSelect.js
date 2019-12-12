import React, { useState } from 'react'
// import { PublisherStatistics } from 'components/dashboard/charts/revenue'
import FilterListIcon from '@material-ui/icons/FilterList'
import PropTypes from 'prop-types'
import { Popover, Chip } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import FormLabel from '@material-ui/core/FormLabel'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import Checkbox from '@material-ui/core/Checkbox'

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

export default function ChipMultipleSelect(props) {
	const [anchorDatePicker, setAnchorDatePicker] = useState(null)
	const { state, setState, items, label } = props
	const classes = useStyles()

	const handleSelectAllClick = event => {
		if (event.target.checked) {
			let newSelecteds = {}
			items.map(n => (newSelecteds[n.name] = true))
			setState(newSelecteds)
			return
		}
		setState({})
	}

	// const selectedCount = Object.values(state || {})
	const selectedCount = Object.keys(state).map(function(e) {
		return state[e] === true
	}).length
	return (
		<React.Fragment>
			<Chip
				label={label}
				onClick={e => setAnchorDatePicker(e.currentTarget)}
				icon={<FilterListIcon />}
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
				<FormControl component='fieldset' className={classes.formControl}>
					<FormLabel component='legend'>Filter by Status</FormLabel>
					<FormGroup>
						<FormControlLabel
							control={
								<Checkbox
									indeterminate={
										selectedCount > 0 && selectedCount < items.length
									}
									checked={selectedCount === items.length}
									onChange={handleSelectAllClick}
									inputProps={{ 'aria-label': 'select all filters' }}
								/>
							}
							label={'Select All'}
						/>
						{items.map(item => (
							<FormControlLabel
								control={
									<Checkbox
										checked={state[item.name] ? state[item.name] : false}
										onChange={ev =>
											setState({
												...state,
												[item.name]: ev.target.checked,
											})
										}
										value={item.name}
									/>
								}
								label={item.label}
							/>
						))}
					</FormGroup>
					<FormHelperText>Be careful</FormHelperText>
				</FormControl>
			</Popover>
		</React.Fragment>
	)
}

ChipMultipleSelect.propTypes = {
	state: PropTypes.object.isRequired,
	setState: PropTypes.isRequired,
	items: PropTypes.array.isRequired,
	label: PropTypes.string.isRequired,
}
