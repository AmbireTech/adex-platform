import React from 'react'
import classnames from 'classnames'
import Img from 'components/common/img/Img'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Checkbox from '@material-ui/core/Checkbox'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import VisibilityIcon from '@material-ui/icons/Visibility'
import { makeStyles } from '@material-ui/core/styles'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import { NewCloneUnitDialog } from '../../forms/items/NewItems'
import { formatDateTime, formatTokenAmount } from 'helpers/formatters'
import { bigNumberify } from 'ethers/utils'
import { AdUnit } from 'adex-models'
import { t, selectSide } from 'selectors'
import { execute, cloneItem } from 'actions'
import { useSelector } from 'react-redux'
import EnhancedTableHead from './EnhancedTableHead'
import EnhancedTableToolbar from './EnhancedTableToolbar'
import {
	filterBySearch,
	filterByTags,
	filterByDate,
	stableSort,
	getSorting,
} from './filterHelpers'
const RRTableCell = withReactRouterLink(TableCell)
const RRIconButton = withReactRouterLink(IconButton)

const useStyles = makeStyles(theme => ({
	root: {
		width: '100%',
	},
	paper: {
		width: '100%',
		marginBottom: theme.spacing(2),
	},
	table: {
		// minWidth: 750,
		tableLayout: 'auto',
		width: '100%',
	},
	tableWrapper: {
		overflowX: 'auto',
	},
	visuallyHidden: {
		border: 0,
		clip: 'rect(0 0 0 0)',
		height: 1,
		margin: -1,
		overflow: 'hidden',
		padding: 0,
		position: 'absolute',
		top: 20,
		width: 1,
	},
	spacer: {
		flex: '0',
	},
	cellImg: {
		width: 'auto',
		height: 'auto',
		maxHeight: 70,
		maxWidth: 180,
		cursor: 'pointer',
	},
}))

const renderActions = ({ item, to, itemType }) => {
	return (
		<TableCell>
			<Tooltip
				title={t('LABEL_VIEW')}
				// placement='top'
				enterDelay={1000}
			>
				<RRIconButton to={to} variant='contained' aria-label='preview'>
					<VisibilityIcon color='primary' />
				</RRIconButton>
			</Tooltip>
			{itemType === 'AdUnit' ? (
				<Tooltip
					title={t('TOOLTIP_CLONE')}
					// placement='top'
					enterDelay={1000}
				>
					<span>
						<NewCloneUnitDialog
							onBeforeOpen={() =>
								execute(cloneItem({ item, itemType, objModel: AdUnit }))
							}
							iconButton
						/>
					</span>
				</Tooltip>
			) : null}
		</TableCell>
	)
}

export default function EnhancedTable(props) {
	const classes = useStyles()
	const side = useSelector(selectSide)
	const { items, itemType, noActions, validate, handleSelect, listMode } = props
	const [order, setOrder] = React.useState('desc')
	const [orderBy, setOrderBy] = React.useState('created')
	const [orderIsNumeric, setOrderisNumeric] = React.useState(true)
	const [selected, setSelected] = React.useState([])
	const [page, setPage] = React.useState(0)
	const [dense, setDense] = React.useState(true)
	const [rowsPerPage, setRowsPerPage] = React.useState(5)
	const [search, setSearch] = React.useState('')
	const [dateRange, setDateRange] = React.useState({})
	const [filters, setFilters] = React.useState({})

	React.useEffect(() => {
		const isValid = !!selected.length
		if (validate && handleSelect) {
			validate('adUnits', {
				isValid: isValid,
				err: { msg: 'ERR_ADUNITS_REQIURED' },
				dirty: true,
			})
			isValid && handleSelect(selected)
		}
	}, [handleSelect, selected, validate])

	const handleRequestSort = (event, property, numeric) => {
		const isDesc = orderBy === property && order === 'desc'
		setOrder(isDesc ? 'asc' : 'desc')
		setOrderBy(property)
		setOrderisNumeric(numeric)
	}

	const handleSelectAllClick = event => {
		if (event.target.checked) {
			const newSelecteds = items.map(n => n.id)
			setSelected(newSelecteds)
			return
		}
		setSelected([])
	}

	const handleClick = (event, name) => {
		const selectedIndex = selected.indexOf(name)
		let newSelected = []

		if (selectedIndex === -1) {
			newSelected = newSelected.concat(selected, name)
		} else if (selectedIndex === 0) {
			newSelected = newSelected.concat(selected.slice(1))
		} else if (selectedIndex === selected.length - 1) {
			newSelected = newSelected.concat(selected.slice(0, -1))
		} else if (selectedIndex > 0) {
			newSelected = newSelected.concat(
				selected.slice(0, selectedIndex),
				selected.slice(selectedIndex + 1)
			)
		}

		setSelected(newSelected)
	}

	const handleChangePage = (event, newPage) => {
		setPage(newPage)
	}

	const handleChangeRowsPerPage = event => {
		setRowsPerPage(parseInt(event.target.value, 10))
		setPage(0)
	}

	const handleChangeDense = event => {
		setDense(event.target.checked)
	}

	const isSelected = id => selected.indexOf(id) !== -1

	let filteredItems = listMode
		? items
		: filterByDate(
				filterBySearch(filterByTags(items, filters, itemType), search),
				dateRange
		  )

	const emptyRows =
		rowsPerPage -
		Math.min(rowsPerPage, filteredItems.length - 1 - page * rowsPerPage)

	return (
		<div className={classes.root}>
			<Paper className={classes.paper}>
				{!listMode && (
					<EnhancedTableToolbar
						numSelected={selected.length}
						itemType={itemType}
						search={search}
						setSearch={setSearch}
						dateRange={dateRange}
						setDateRange={setDateRange}
						filters={filters}
						setFilters={setFilters}
						noActions={noActions}
						listMode={listMode}
					/>
				)}

				<div className={classes.tableWrapper}>
					<Table
						className={classes.table}
						aria-labelledby='tableTitle'
						size={dense ? 'small' : 'medium'}
						aria-label='enhanced table'
					>
						<EnhancedTableHead
							itemType={itemType}
							classes={classes}
							numSelected={selected.length}
							order={order}
							orderBy={orderBy}
							onSelectAllClick={handleSelectAllClick}
							onRequestSort={handleRequestSort}
							rowCount={items.length}
							noActions={noActions}
							listMode={listMode}
						/>
						<TableBody>
							{stableSort(
								filteredItems,
								getSorting(order, orderBy, orderIsNumeric)
							)
								.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
								.map((item, index) => {
									// Campaigns renderer
									const isItemSelected = isSelected(item.id)
									const labelId = `enhanced-table-checkbox-${index}`
									const firstUnit = (item.adUnits && item.adUnits[0]) || {}
									const mediaUrl = firstUnit.mediaUrl || item.mediaUrl || ''
									const mediaMime = firstUnit.mediaMime || item.mediaMime || ''
									return (
										<TableRow
											hover
											role='checkbox'
											aria-checked={isItemSelected}
											tabIndex={-1}
											key={item.id}
											selected={isItemSelected}
										>
											{!listMode && (
												<TableCell padding='checkbox'>
													<Checkbox
														checked={isItemSelected}
														inputProps={{ 'aria-labelledby': labelId }}
														onClick={event => handleClick(event, item.id)}
													/>
												</TableCell>
											)}
											<TableCell>
												<Img
													fullScreenOnClick={true}
													className={classnames(classes.cellImg)}
													src={mediaUrl}
													alt={item.title}
													mediaMime={mediaMime}
													allowVideo
												/>
											</TableCell>
											{itemType === 'Campaign' ? (
												<React.Fragment>
													<TableCell> {item.status.name} </TableCell>
													<TableCell>
														{formatTokenAmount(item.depositAmount, 18, true)}{' '}
														SAI{' '}
													</TableCell>
													<TableCell>
														{(
															(item.status.fundsDistributedRatio || 0) / 10
														).toFixed(2)}
													</TableCell>
													<TableCell>
														{formatTokenAmount(
															bigNumberify(item.minPerImpression).mul(1000),
															18,
															true
														)}{' '}
														SAI
													</TableCell>
													<TableCell>{formatDateTime(item.created)}</TableCell>
													<TableCell>
														{formatDateTime(item.activeFrom)}
													</TableCell>
													<TableCell>
														{formatDateTime(item.withdrawPeriodStart)}
													</TableCell>
												</React.Fragment>
											) : (
												<React.Fragment>
													<RRTableCell
														to={`/dashboard/${side}/${itemType}/${item.id}`}
													>
														{item.title}
													</RRTableCell>
													<TableCell> {item.type} </TableCell>
													<TableCell>{formatDateTime(item.created)}</TableCell>
												</React.Fragment>
											)}
											{!noActions &&
												renderActions({
													item,
													to: `/dashboard/${side}/${itemType}/${item.id}`,
													itemType,
												})}
										</TableRow>
									)
								})}
							{emptyRows > 0 && (
								<TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
									<TableCell colSpan={6} />
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
				<TablePagination
					rowsPerPageOptions={[5, 10, 25]}
					component='div'
					classes={{ spacer: classes.spacer }}
					count={filteredItems.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onChangePage={handleChangePage}
					onChangeRowsPerPage={handleChangeRowsPerPage}
				/>
			</Paper>
			{/* Dense Switch */}
			{/* <FormControlLabel
				control={<Switch checked={dense} onChange={handleChangeDense} />}
				label='Dense padding'
			/> */}
		</div>
	)
}
