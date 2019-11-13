import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import IconButton from '@material-ui/core/IconButton'
import Dropdown from 'components/common/dropdown'
import Input from '@material-ui/core/Input'
import { Pagination } from './Controls'
import Translate from 'components/translate/Translate'
// import classnames from 'classnasmes'
// import Radio from '@material-ui/core/Radio'
// import RadioGroup from '@material-ui/core/RadioGroup'
// import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import InputAdornment from '@material-ui/core/InputAdornment'
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward'
import SearchIcon from '@material-ui/icons/Search'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import classnames from 'classnames'
import Paper from '@material-ui/core/Paper'
import Divider from '@material-ui/core/Divider'
import { bigNumberify } from 'ethers/utils'

const INT_STRING = /^[0-9]+$/
const PAGE_SIZE = 50

const mapFilterProps = ({ filterProps = {}, t }) => {
	return Object.keys(filterProps).map(key => {
		const prop = filterProps[key]
		const label = prop.label || key
		return {
			label: t(label, {
				isProp: prop.labelIsProp || !prop.label,
				args: prop.labelArgs || [],
			}),
			value: key,
		}
	})
}

const mapSortProperties = ({ sortProps = [], t }) => {
	return sortProps.map(prop => {
		const label = prop.label || prop.value
		const value = (prop.value !== null && prop.value !== undefined
			? prop.value
			: ''
		).toString()

		return {
			value,
			label: t(label, { isProp: !prop.label, args: prop.labelArgs || [] }),
		}
	})
}

class ListWithControls extends Component {
	constructor(props, context) {
		super(props, context)

		const uiStateId = props.uiStateId

		const sortProperties = mapSortProperties({
			sortProps: props.sortProperties || [{}],
			t: props.t,
		})
		// TODO: update on ComponentWillReceiveProps
		this.state = {
			items: [],
			page: 0, //
			search: '', //
			sortProperties: sortProperties,
			filterProperties: mapFilterProps({
				filterProps: props.filterProperties,
				t: props.t,
			}),
			filteredItems: [],
			filterBy: '', //
			filterByValues: [],
			filterByValueFilter: '', //
			uiStateId: uiStateId,
		}
	}

	goToPage(page) {
		this.setState({ page: parseInt(page, 10) })
	}

	handleChange = (name, value) => {
		let newStateValue = { [name]: value }
		if (name === 'search') newStateValue.page = 0
		if (name === 'filterBy') {
			newStateValue.filterByValues = [{ label: 'ALL', value: '' }].concat(
				this.props.filterProperties[value].values
			)
			newStateValue.filterByValueFilter = ''
		}
		this.setState(newStateValue)
	}

	// For changing redux state
	handleChangeRxState = (name, value) => {
		this.props.actions.updateUi(name, value, this.state.uiStateId)
	}

	changePageSize = (
		name,
		{ itemsLength, page, pages } = {},
		ev,
		newPageSize
	) => {
		/*
    	let currentPageSize = this.props.pageSize
    	let currentFirstIndex = page * currentPageSize // To have at least the first item on current page on the next page
		let nextPage = Math.floor(currentFirstIndex / newPageSize)
		*/
		this.props.actions.updateUi('pageSize', newPageSize, this.state.uiStateId)
	}

	search = ({ item, search, searchMatch }) => {
		const regex = new RegExp(search, 'i')
		let matchString = null
		if (typeof searchMatch === 'function') {
			matchString = searchMatch(item)
		} else if (typeof searchMatch === 'string' && !!searchMatch) {
			matchString = searchMatch
		} else {
			matchString = (item.title || '') + (item.description || '')
		}

		const match = regex.exec(matchString)
		return !!match
	}

	filterItems = ({
		items,
		search,
		sortProperty,
		sortOrder,
		page,
		pageSize,
		searchMatch,
		filterBy,
		filterArchived,
	}) => {
		// TODO: optimize filter
		// TODO: maybe filter deleted before this?
		let filtered = (items || []).filter(i => {
			const isItem = !!i && (i.id || i.ipfs)
			if (!isItem) return isItem

			if (
				filterArchived !== '' &&
				i.archived !== undefined &&
				filterArchived.toString() !== i.archived.toString()
			) {
				return false
			}

			if (filterBy && filterBy.key && filterBy.value) {
				let itemValue =
					filterBy.key.split('.').reduce((o, p) => (o ? o[p] : 'noprop'), i) ||
					''

				let passFilter = itemValue.toString() === filterBy.value.toString()

				if (!passFilter) {
					return false
				}
			}

			let hasSearch = !!search
			if (!hasSearch) return isItem

			return this.search({ item: i, search, searchMatch })
		})

		if (sortProperty) {
			filtered = filtered.sort((a, b) => {
				let propA = a[sortProperty]
				let propB = b[sortProperty]

				if (INT_STRING.test(propA) && INT_STRING.test(propB)) {
					propA = bigNumberify(propA)
					propB = bigNumberify(propB)
					return (propA.lt(propB) ? -1 : propA.gt(propB) ? 1 : 0) * sortOrder
				}

				return (propA < propB ? -1 : propA > propB ? 1 : 0) * sortOrder
			})
		}

		let filteredLength = filtered.length

		let maxPages = Math.ceil(filteredLength / pageSize)

		let paged = filtered.slice(page * pageSize, page * pageSize + pageSize)

		return {
			items: paged,
			page: page,
			pages: maxPages,
			itemsLength: filteredLength,
			pageSize: pageSize,
		}
	}

	render() {
		let data = this.filterItems({
			items: this.props.items,
			search: this.state.search,
			sortProperty:
				this.props.sortProperty || this.state.sortProperties[0].value,
			sortOrder: this.props.sortOrder || -1,
			page: this.state.page,
			pageSize: PAGE_SIZE, // this.props.pageSize || 10,
			searchMatch: this.props.searchMatch,
			filterBy: {
				key: this.state.filterBy,
				value: this.state.filterByValueFilter,
			},
			filterArchived: this.props.filterArchived || 'false',
		})

		let items = data.items
		let renderItems

		renderItems = this.props.renderRows

		const { t, classes } = this.props

		return (
			<Paper>
				<div className={classes.controlsRoot}>
					<div className={classes.controls}>
						<FormControl className={classnames(classes.flexItem)}>
							<InputLabel htmlFor='search'>
								{t('LIST_CONTROL_LABEL_SEARCH')}
							</InputLabel>
							<Input
								name='search'
								id='search'
								value={this.state.search}
								onChange={ev => this.handleChange('search', ev.target.value)}
								startAdornment={
									<InputAdornment position='start'>
										<SearchIcon />
									</InputAdornment>
								}
							/>
						</FormControl>
						<div className={classnames(classes.flexRow, classes.flexItem)}>
							<Dropdown
								label={t('LIST_CONTROL_LABEL_SORT')}
								onChange={this.handleChangeRxState.bind(this, 'sortProperty')}
								source={this.state.sortProperties}
								value={
									this.props.sortProperty || this.state.sortProperties[0].value
								}
								htmlId='sort-by-prop'
								name='sortProperty'
							/>
							<div>
								<IconButton
									color={this.props.sortOrder === 1 ? 'primary' : 'default'}
									onClick={this.handleChangeRxState.bind(this, 'sortOrder', 1)}
									className={classes.rowButton}
									size='small'
								>
									<ArrowUpwardIcon />
								</IconButton>
								<IconButton
									color={this.props.sortOrder === -1 ? 'primary' : 'default'}
									onClick={this.handleChangeRxState.bind(this, 'sortOrder', -1)}
									className={classes.rowButton}
									size='small'
								>
									<ArrowDownwardIcon />
								</IconButton>
							</div>
						</div>

						{/* {this.props.filterProperties &&
							<div
								className={classnames(classes.flexRow)}
							>
								<Dropdown
									className={classnames(classes.flexItem)}
									auto
									label={t('LIST_CONTROL_LABEL_FILTER_BY')}
									onChange={this.handleChange.bind(this, 'filterBy')}
									source={this.state.filterProperties}
									value={this.state.filterBy !== null ? this.state.filterBy.toString() : ''}
									htmlId='filter-by-prop-dd'
									name='filterBy'
									displayEmpty
								/>
								<Dropdown
									className={classnames(classes.flexItem)}
									auto
									label={t('LIST_CONTROL_LABEL_FILTER_BY_VALUE')}
									onChange={this.handleChange.bind(this, 'filterByValueFilter')}
									source={mapSortProperties({ sortProps: this.state.filterByValues, t: this.props.t })}
									value={this.state.filterByValueFilter !== null ? this.state.filterByValueFilter.toString() : ''}
									htmlId='filter-by-value-dd'
									name='filterByValueFilter'
									displayEmpty
									disabled={!this.state.filterBy}
									helperText={t('HELPER_TXT_FILTER_BY_VALUE')}
								/>
							</div>
						} */}

						{/* {this.props.archive &&
							<RadioGroup
								name='archived'
								value={typeof this.props.filterArchived === 'string' ? this.props.filterArchived.toString() : 'false'}
								onChange={(ev) => this.handleChangeRxState('filterArchived', ev.target.value)}
								className={classnames(classes.flexRow, classes.flexItem)}
							>
								<FormControlLabel value='false' control={<Radio color='primary' />} label={t('LABEL_ACTIVE')} />
								<FormControlLabel value='true' control={<Radio color='primary' />} label={t('LABEL_ARCHIVED')} />
								<FormControlLabel value='' control={<Radio color='primary' />} label={t('LABEL_ALL')} />
							</RadioGroup>
						} */}
						<div
							className={classnames(classes.controls, classes.bottomControls)}
						>
							<Pagination
								t={t}
								page={data.page}
								pages={data.pages}
								pageSize={PAGE_SIZE || this.props.pageSize || 10}
								itemsLength={data.itemsLength}
								goToPage={this.goToPage.bind(this)}
								goToLastPage={this.goToPage.bind(this, data.pages - 1)}
								goToNextPage={this.goToPage.bind(this, data.page + 1)}
								goToFirstPage={this.goToPage.bind(this, 0)}
								goToPrevPage={this.goToPage.bind(this, data.page - 1)}
								changePageSize={this.changePageSize.bind(this, 'pageSize', {
									page: data.page,
									pages: data.pages,
									itemsLength: data.itemsLength,
								})}
							/>
						</div>
					</div>
				</div>
				<Divider />
				<div className={classnames(classes.listRoot)}>{renderItems(items)}</div>
			</Paper>
		)
	}
}

ListWithControls.propTypes = {
	actions: PropTypes.object.isRequired,
	items: PropTypes.array.isRequired,
	rowsView: PropTypes.bool.isRequired,
	itemRenderer: PropTypes.func,
	side: PropTypes.string.isRequired,
	objModel: PropTypes.func,
	sortProperties: PropTypes.array.isRequired,
	filterProperties: PropTypes.object,
	uiStateId: PropTypes.string.isRequired,
}

function mapStateToProps(state, props) {
	const persist = state.persist
	const memory = state.memory

	// TODO: A little hacky, maybe find a better way
	// Gets the last path in URL. ex: https://localhost:3000/dashboard/publisher/slots -> slots
	const uiStateId = props.uiStateId || 'default'
	return {
		rowsView: !!persist.ui[props.viewModeId],
		pageSize: persist.ui[uiStateId]
			? persist.ui[uiStateId]['pageSize'] || 10
			: 10,
		sortProperty: persist.ui[uiStateId]
			? persist.ui[uiStateId]['sortProperty']
			: null,
		sortOrder: persist.ui[uiStateId]
			? persist.ui[uiStateId]['sortOrder'] || -1
			: -1,
		filterArchived: persist.ui[uiStateId]
			? persist.ui[uiStateId]['filterArchived'] || false
			: false,
		side: memory.nav.side,
		sortProperties: props.sortProperties || [],
		filterProperties: props.filterProperties,
		uiStateId: uiStateId,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch),
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(withStyles(styles)(ListWithControls)))
