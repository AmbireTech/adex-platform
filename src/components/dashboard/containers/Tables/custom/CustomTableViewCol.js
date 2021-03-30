import React from 'react'
import PropTypes from 'prop-types'
import Checkbox from '@material-ui/core/Checkbox'
import Typography from '@material-ui/core/Typography'
import FormControl from '@material-ui/core/FormControl'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { makeStyles } from '@material-ui/core/styles'
import { Divider } from '@material-ui/core'

// Extracted from
// https://github.com/gregnb/mui-datatables/blob/bb0cf931decae7e5bec49a6b5f3343408bc4c0b5/src/components/TableViewCol.js

const useStyles = makeStyles(
	theme => ({
		root: {
			padding: '16px 24px 16px 24px',
			fontFamily: 'Roboto',
		},
		title: {
			marginLeft: '-7px',
			marginRight: '24px',
			fontSize: '14px',
			color: theme.palette.text.secondary,
			textAlign: 'left',
			fontWeight: 500,
		},
		formGroup: {
			marginTop: '8px',
		},
		formControl: {},
		checkbox: {
			padding: '0px',
			width: '32px',
			height: '32px',
		},
		checkboxRoot: {},
		checked: {},
		label: {
			fontSize: '15px',
			marginLeft: '8px',
			color: theme.palette.text.primary,
		},
	}),
	{ name: 'MUIDataTableViewCol' }
)

const CustomTableViewCol = ({
	columns,
	options,
	components = {},
	onColumnUpdate,
	updateColumns,
}) => {
	const classes = useStyles()
	const textLabels = options.textLabels.viewColumns
	const CheckboxComponent = components.Checkbox || Checkbox

	const handleColChange = index => {
		onColumnUpdate(index)
	}

	const toggleAllColumns = () => {
		const newColumns = {}
		const atLeastOneUnchecked = columns.some(e => e.display === 'false')
		columns.forEach(c => {
			newColumns[c.name] = atLeastOneUnchecked ? true : false
		})
		updateColumns(newColumns)
	}

	return (
		<FormControl
			component={'fieldset'}
			className={classes.root}
			aria-label={textLabels.titleAria}
		>
			<Typography variant='caption' className={classes.title}>
				{textLabels.title}
			</Typography>
			<FormGroup className={classes.formGroup}>
				<FormControlLabel
					classes={{
						root: classes.formControl,
						label: classes.label,
					}}
					control={
						<CheckboxComponent
							color='primary'
							data-description='table-view-col'
							className={classes.checkbox}
							classes={{
								root: classes.checkboxRoot,
								checked: classes.checked,
							}}
							indeterminate={
								columns.some(e => e.display === 'true') &&
								!columns.every(e => e.display === 'true')
							}
							onChange={() => toggleAllColumns()}
							checked={columns.every(e => e.display === 'true')}
							value={'select-all'}
						/>
					}
					label={'Select All'}
				/>
				<Divider />
				{columns.map((column, index) => {
					return (
						column.display !== 'excluded' &&
						column.viewColumns !== false && (
							<FormControlLabel
								key={index}
								classes={{
									root: classes.formControl,
									label: classes.label,
								}}
								control={
									<CheckboxComponent
										color='primary'
										data-description='table-view-col'
										className={classes.checkbox}
										classes={{
											root: classes.checkboxRoot,
											checked: classes.checked,
										}}
										onChange={() => handleColChange(index)}
										checked={column.display === 'true'}
										value={column.name}
									/>
								}
								label={column.label}
							/>
						)
					)
				})}
			</FormGroup>
		</FormControl>
	)
}

CustomTableViewCol.propTypes = {
	/** Columns used to describe table */
	columns: PropTypes.array.isRequired,
	/** Options used to describe table */
	options: PropTypes.object.isRequired,
	/** Callback to trigger View column update */
	onColumnUpdate: PropTypes.func,
	/** Extend the style applied to components */
	classes: PropTypes.object,
}

export default CustomTableViewCol
