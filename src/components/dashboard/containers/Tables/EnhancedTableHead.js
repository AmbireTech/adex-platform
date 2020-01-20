import React from 'react'
import PropTypes from 'prop-types'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Checkbox from '@material-ui/core/Checkbox'
import { headCells } from './tableConfig'

export default function EnhancedTableHead(props) {
	const {
		classes,
		onSelectAllClick,
		order,
		orderBy,
		numSelected,
		rowCount,
		onRequestSort,
		itemType,
		noActions,
		listMode,
	} = props
	const createSortHandler = (property, numeric, isDate) => event => {
		onRequestSort(event, property, numeric, isDate)
	}
	const headSide = itemType === 'Campaign' ? itemType : 'Other'
	return (
		<TableHead>
			<TableRow>
				{!listMode && (
					<TableCell padding='checkbox'>
						<Checkbox
							indeterminate={numSelected > 0 && numSelected < rowCount}
							checked={numSelected === rowCount}
							onChange={onSelectAllClick}
							inputProps={{ 'aria-label': 'select all desserts' }}
						/>
					</TableCell>
				)}
				{headCells[headSide].map(headCell => (
					<TableCell
						key={headCell.id}
						align={'left'}
						padding={'default'}
						sortDirection={orderBy === headCell.id ? order : false}
					>
						{!headCell.disableOrdering && !listMode ? (
							<TableSortLabel
								active={orderBy === headCell.id}
								direction={order}
								onClick={createSortHandler(
									headCell.id,
									headCell.numeric,
									headCell.isDate
								)}
							>
								{headCell.label}
								{orderBy === headCell.id ? (
									<span className={classes.visuallyHidden}>
										{order === 'desc'
											? 'sorted descending'
											: 'sorted ascending'}
									</span>
								) : null}
							</TableSortLabel>
						) : (
							<div>{headCell.label}</div>
						)}
					</TableCell>
				))}
				{!noActions && (
					<TableCell align={'left'} padding={'default'}>
						<div>{'Actions'}</div>
					</TableCell>
				)}
			</TableRow>
		</TableHead>
	)
}

EnhancedTableHead.propTypes = {
	itemType: PropTypes.string.isRequired,
	classes: PropTypes.object.isRequired,
	numSelected: PropTypes.number.isRequired,
	onRequestSort: PropTypes.func.isRequired,
	onSelectAllClick: PropTypes.func.isRequired,
	order: PropTypes.oneOf(['asc', 'desc']).isRequired,
	orderBy: PropTypes.string.isRequired,
	rowCount: PropTypes.number.isRequired,
}
