import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import classnames from 'classnames'
import Img from 'components/common/img/Img'
import Button from '@material-ui/core/Button'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import InputAdornment from '@material-ui/core/InputAdornment'
import Input from '@material-ui/core/Input'
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
import SearchIcon from '@material-ui/icons/Search'
import DeleteIcon from '@material-ui/icons/Delete'
import ArchiveIcon from '@material-ui/icons/Archive'
import VisibilityIcon from '@material-ui/icons/Visibility'
import FilterListIcon from '@material-ui/icons/FilterList'
import DateRangeIcon from '@material-ui/icons/DateRange'
import { lighten, makeStyles } from '@material-ui/core/styles'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import { NewCloneUnitDialog } from '../../forms/items/NewItems'
import { formatDateTime, formatTokenAmount } from 'helpers/formatters'
import { bigNumberify } from 'ethers/utils'
import { AdUnit } from 'adex-models'
import { t, selectSide } from 'selectors'
import { execute, cloneItem } from 'actions'
import { useSelector } from 'react-redux'

const RRTableCell = withReactRouterLink(TableCell)
const RRIconButton = withReactRouterLink(IconButton)

function desc(a, b, orderBy, numeric) {
	const subCategories = orderBy.split('.')
	subCategories.forEach(prop => {
		a = a[prop]
		b = b[prop]
	})
	if (numeric) {
		a = Number(a)
		b = Number(b)
	}

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

function getSorting(order, orderBy, orderToken) {
	return order === 'desc'
		? (a, b) => desc(a, b, orderBy, orderToken)
		: (a, b) => -desc(a, b, orderBy, orderToken)
}

const headCells = {
	Campaign: [
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
	],
	Other: [
		{
			id: 'id',
			numeric: false,
			disablePadding: true,
			disableOrdering: true,
			label: t('PROP_MEDIA'),
		},
		{
			id: 'title',
			numeric: false,
			disablePadding: false,
			label: t('PROP_TITLE'),
		},
		{
			id: 'type',
			numeric: false,
			disablePadding: false,
			label: t('PROP_TYPE'),
		},
		{
			id: 'created',
			numeric: false,
			disablePadding: false,
			label: t('PROP_CREATED'),
		},
		{
			id: 'actions',
			numeric: true,
			disablePadding: false,
			disableOrdering: true,
			label: t('ACTIONS'),
		},
	],
}

function EnhancedTableHead(props) {
	const {
		classes,
		onSelectAllClick,
		order,
		orderBy,
		numSelected,
		rowCount,
		onRequestSort,
		itemType,
	} = props
	const createSortHandler = (property, numeric) => event => {
		onRequestSort(event, property, numeric)
	}
	let headSide = itemType === 'Campaign' ? itemType : 'Other'

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
				{headCells[headSide].map(headCell => (
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
								onClick={createSortHandler(headCell.id, headCell.numeric)}
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
	itemType: PropTypes.object.isRequired,
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
	const { numSelected, search, setSearch } = props

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
						<IconButton aria-label='filter list'>
							<FilterListIcon />
						</IconButton>
					</Tooltip>
					<Tooltip title='Select Date Range'>
						<IconButton aria-label='date range'>
							<DateRangeIcon />
						</IconButton>
					</Tooltip>
				</React.Fragment>
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
	const [orderBy, setOrderBy] = React.useState('depositAmount')
	const [orderIsNumeric, setOrderisNumeric] = React.useState(true)
	const [search, setSearch] = React.useState('')
	const [selected, setSelected] = React.useState([])
	const [page, setPage] = React.useState(0)
	const [dense, setDense] = React.useState(false)
	const [rowsPerPage, setRowsPerPage] = React.useState(5)

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

	const filterBySearch = (items, search) => {
		return items.filter(
			item =>
				(item.title &&
					item.title.toLowerCase().includes(search.toLowerCase())) ||
				(item.description &&
					item.description.toLowerCase().includes(search.toLowerCase())) ||
				(item.type && item.type.toLowerCase().includes(search.toLowerCase())) ||
				(item.status &&
					item.status.name &&
					item.status.name.toLowerCase().includes(search.toLowerCase())) ||
				(item.id && item.id.toLowerCase() === search.toLowerCase())
			// We can search on more fields as well
		)
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
					search={search}
					setSearch={setSearch}
				/>
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
						/>
						<TableBody>
							{stableSort(
								filterBySearch(items, search),
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
											<TableCell padding='checkbox'>
												<Checkbox
													checked={isItemSelected}
													inputProps={{ 'aria-labelledby': labelId }}
													onClick={event => handleClick(event, item.id)}
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
													<TableCell>
														{' '}
														{formatDateTime(item.created)}{' '}
													</TableCell>
												</React.Fragment>
											)}
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
