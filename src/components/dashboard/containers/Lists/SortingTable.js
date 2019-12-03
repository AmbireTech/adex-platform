import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import classnames from 'classnames'
import Img from 'components/common/img/Img'
import Button from '@material-ui/core/Button'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TablePagination from '@material-ui/core/TablePagination'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import Checkbox from '@material-ui/core/Checkbox'
import IconButton from '@material-ui/core/IconButton'
import Tooltip from '@material-ui/core/Tooltip'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import DeleteIcon from '@material-ui/icons/Delete'
import ArchiveIcon from '@material-ui/icons/Archive'
import VisibilityIcon from '@material-ui/icons/Visibility'
import FilterListIcon from '@material-ui/icons/FilterList'
import { lighten, makeStyles } from '@material-ui/core/styles'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import { NewCloneUnitDialog } from '../../forms/items/NewItems'
import { formatDateTime, formatTokenAmount } from 'helpers/formatters'
import { bigNumberify } from 'ethers/utils'
import { AdUnit } from 'adex-models'
import { t, selectSide } from 'selectors'
import { execute, cloneItem } from 'actions'
import { useSelector } from 'react-redux'

const RRIconButton = withReactRouterLink(IconButton)

// function createData(name, calories, fat, carbs, protein) {
// 	return { name, calories, fat, carbs, protein }
// }

// const rows = [
// 	createData('Cupcake', 305, 3.7, 67, 4.3),
// 	createData('Donut', 452, 25.0, 51, 4.9),
// 	createData('Eclair', 262, 16.0, 24, 6.0),
// 	createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
// 	createData('Gingerbread', 356, 16.0, 49, 3.9),
// 	createData('Honeycomb', 408, 3.2, 87, 6.5),
// 	createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
// 	createData('Jelly Bean', 375, 0.0, 94, 0.0),
// 	createData('KitKat', 518, 26.0, 65, 7.0),
// 	createData('Lollipop', 392, 0.2, 98, 0.0),
// 	createData('Marshmallow', 318, 0, 81, 2.0),
// 	createData('Nougat', 360, 19.0, 9, 37.0),
// 	createData('Oreo', 437, 18.0, 63, 4.0),
// ]

function desc(a, b, orderBy) {
	const subCategories = orderBy.split('.')
	subCategories.forEach(prop => {
		a = a[prop]
		b = b[prop]
	})
	if (b < a) return -1
	if (b > a) return 1
	return 0
}

function stableSort(array, cmp) {
	const stabilizedThis = array.map((el, index) => [el, index])
	stabilizedThis.sort((a, b) => {
		const order = cmp(a[0], b[0])
		if (order !== 0) return order
		return a[1] - b[1]
	})
	return stabilizedThis.map(el => el[0])
}

function getSorting(order, orderBy) {
	return order === 'desc'
		? (a, b) => desc(a, b, orderBy)
		: (a, b) => -desc(a, b, orderBy)
}

const headCells = [
	{
		id: 'title',
		numeric: false,
		disablePadding: true,
		disableOrdering: true,
		label: t('PROP_MEDIA'),
	},
	{
		id: 'status.name',
		numeric: true,
		disablePadding: false,
		label: t('PROP_STATUS'),
	},
	{
		id: 'depositAmount',
		numeric: true,
		disablePadding: false,
		label: t('PROP_DEPOSIT'),
	},
	{
		id: 'status.fundsDistributedRatio',
		numeric: true,
		disablePadding: false,
		label: t('PROP_DISTRIBUTED', { args: ['%'] }),
	},
	{
		id: 'minPerImpression',
		numeric: true,
		disablePadding: false,
		label: t('PROP_CPM'),
	},
	{
		id: 'activeFrom',
		numeric: true,
		disablePadding: false,
		label: t('PROP_STARTS'),
	},
	{
		id: 'withdrawPeriodStart',
		numeric: true,
		disablePadding: false,
		label: t('PROP_ENDS'),
	},
	{
		id: 'actions',
		numeric: true,
		disablePadding: false,
		disableOrdering: true,
		label: t('ACTIONS'),
	},
]

function EnhancedTableHead(props) {
	const {
		classes,
		onSelectAllClick,
		order,
		orderBy,
		numSelected,
		rowCount,
		onRequestSort,
	} = props
	const createSortHandler = property => event => {
		onRequestSort(event, property)
	}

	return (
		<TableHead>
			<TableRow>
				<TableCell padding='checkbox'>
					<Checkbox
						indeterminate={numSelected > 0 && numSelected < rowCount}
						checked={numSelected === rowCount}
						onChange={onSelectAllClick}
						inputProps={{ 'aria-label': 'select all desserts' }}
					/>
				</TableCell>
				{headCells.map(headCell => (
					<TableCell
						key={headCell.id}
						align={'left'}
						padding={headCell.disablePadding ? 'none' : 'default'}
						sortDirection={orderBy === headCell.id ? order : false}
					>
						{!headCell.disableOrdering ? (
							<TableSortLabel
								active={orderBy === headCell.id}
								direction={order}
								onClick={createSortHandler(headCell.id)}
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
			</TableRow>
		</TableHead>
	)
}

EnhancedTableHead.propTypes = {
	classes: PropTypes.object.isRequired,
	numSelected: PropTypes.number.isRequired,
	onRequestSort: PropTypes.func.isRequired,
	onSelectAllClick: PropTypes.func.isRequired,
	order: PropTypes.oneOf(['asc', 'desc']).isRequired,
	orderBy: PropTypes.string.isRequired,
	rowCount: PropTypes.number.isRequired,
}

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

const EnhancedTableToolbar = props => {
	const classes = useToolbarStyles()
	const { numSelected, itemType } = props

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
				<Typography className={classes.title} variant='h6' id='tableTitle'>
					{`${itemType}s`}
				</Typography>
			)}

			{numSelected > 0 ? (
				<Tooltip title='Archive'>
					<IconButton aria-label='archive'>
						<ArchiveIcon />
					</IconButton>
				</Tooltip>
			) : (
				<Tooltip title='Filter list'>
					<IconButton aria-label='filter list'>
						<FilterListIcon />
					</IconButton>
				</Tooltip>
			)}
		</Toolbar>
	)
}

EnhancedTableToolbar.propTypes = {
	numSelected: PropTypes.number.isRequired,
}

const useStyles = makeStyles(theme => ({
	root: {
		width: '100%',
	},
	paper: {
		width: '100%',
		marginBottom: theme.spacing(2),
	},
	table: {
		minWidth: 750,
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
	const { items, itemType } = props
	const [order, setOrder] = React.useState('desc')
	const [orderBy, setOrderBy] = React.useState('activeFrom')
	const [selected, setSelected] = React.useState([])
	const [page, setPage] = React.useState(0)
	const [dense, setDense] = React.useState(false)
	const [rowsPerPage, setRowsPerPage] = React.useState(5)

	const handleRequestSort = (event, property) => {
		const isDesc = orderBy === property && order === 'desc'
		setOrder(isDesc ? 'asc' : 'desc')
		setOrderBy(property)
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

	const emptyRows =
		rowsPerPage - Math.min(rowsPerPage, items.length - 1 - page * rowsPerPage)

	return (
		<div className={classes.root}>
			<Paper className={classes.paper}>
				<EnhancedTableToolbar
					numSelected={selected.length}
					itemType={itemType}
				/>
				<div className={classes.tableWrapper}>
					<Table
						className={classes.table}
						aria-labelledby='tableTitle'
						size={dense ? 'small' : 'medium'}
						aria-label='enhanced table'
					>
						<EnhancedTableHead
							classes={classes}
							numSelected={selected.length}
							order={order}
							orderBy={orderBy}
							onSelectAllClick={handleSelectAllClick}
							onRequestSort={handleRequestSort}
							rowCount={items.length}
						/>
						<TableBody>
							{stableSort(items, getSorting(order, orderBy))
								.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
								.map((item, index) => {
									// Campaigns renderer
									const isItemSelected = isSelected(item.id)
									const labelId = `enhanced-table-checkbox-${index}`
									const firstUnit = item.adUnits[0] || {}
									const mediaUrl = firstUnit.mediaUrl || ''
									const mediaMime = firstUnit.mediaMime || ''
									return (
										<TableRow
											hover
											onClick={event => handleClick(event, item.id)}
											role='checkbox'
											aria-checked={isItemSelected}
											tabIndex={-1}
											key={item.id}
											selected={isItemSelected}
										>
											<TableCell padding='checkbox'>
												<Checkbox
													checked={isItemSelected}
													inputProps={{ 'aria-labelledby': labelId }}
												/>
											</TableCell>
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
											<TableCell> {item.status.name} </TableCell>
											<TableCell>
												{' '}
												{formatTokenAmount(
													item.depositAmount,
													18,
													true
												)} SAI{' '}
											</TableCell>
											<TableCell>
												{' '}
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
											<TableCell>{formatDateTime(item.activeFrom)}</TableCell>
											<TableCell>
												{formatDateTime(item.withdrawPeriodStart)}
											</TableCell>
											{renderActions({
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
					count={items.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onChangePage={handleChangePage}
					onChangeRowsPerPage={handleChangeRowsPerPage}
				/>
			</Paper>
			<FormControlLabel
				control={<Switch checked={dense} onChange={handleChangeDense} />}
				label='Dense padding'
			/>
		</div>
	)
}
