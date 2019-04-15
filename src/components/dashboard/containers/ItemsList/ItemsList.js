import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import ListWithControls from 'components/dashboard/containers/Lists/ListWithControls'
import classnames from 'classnames'
import { items as ItemsConstants } from 'adex-constants'
import moment from 'moment'
import TableCellMui from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Tooltip from '@material-ui/core/Tooltip'
import Button from '@material-ui/core/Button'
import Checkbox from '@material-ui/core/Checkbox'
import IconButton from '@material-ui/core/IconButton'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import { Item } from 'adex-models'
import Img from 'components/common/img/Img'
import Rows from 'components/dashboard/collection/Rows'
import Card from 'components/dashboard/containers/ItemCard'
import Translate from 'components/translate/Translate'
// import DeleteIcon from '@material-ui/icons/Delete'
import ArchiveIcon from '@material-ui/icons/Archive'
import UnarchiveIcon from '@material-ui/icons/Unarchive'
import RemoveCircleOutlineIcon from '@material-ui/icons/RemoveCircleOutline'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline'
import { itemAdTypeLabel, itemAdSizeLabel } from 'helpers/itemsHelpers'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

const { ItemTypesNames } = ItemsConstants

const TableCell = ({ children, ...rest }) =>
	<TableCellMui
		padding='dense'
		{...rest}
	>
		{!!children && children}
	</TableCellMui >

const RRTableCell = withReactRouterLink(TableCell)
const RRButton = withReactRouterLink(Button)

const List = ({ list, itemRenderer }) => {
	return (<div style={{ display: 'flex', flexGrow: 1, flexWrap: 'wrap' }}>
		{list.map((item, index) =>
			<div
				key={item.ipfs || index}
				style={{ maxWidth: '100%' }}
			>
				{itemRenderer(item, index)}
			</div>
		)}
	</div>)
}

class ItemsList extends Component {

	renderCard = (item, index) => {
		// const t = this.props.t
		const itm = new this.props.objModel(item)
		return (
			<Card
				key={itm.ipfs}
				item={itm}
				name={itm.type}
				logo={itm.mediaUrl}
				side={this.props.side}
				remove={null}
				itemType={this.props.itemType}
				renderActions={() => this.renderActions(item)}
			/>
		)
	}

	renderTableHead = ({ selected }) => {
		const { t, selectedItems, selectMode, noActions } = this.props
		return (
			<TableHead>
				<TableRow>
					{selectMode &&
						<TableCell>
							{Object.keys(selectedItems).length || ''}
						</TableCell>
					}
					<TableCell></TableCell>
					<TableCell> {t('PROP_NAME')} </TableCell>
					<TableCell> {t('PROP_ADTYPE')} </TableCell>
					<TableCell> {t('PROP_CREATEDON')} </TableCell>
					{!noActions &&
						<TableCell> {t('ACTIONS')} </TableCell>
					}
				</TableRow>
			</TableHead>
		)
	}

	renderTableRow = (item, index, { selected }) => {
		const { t, classes, selectMode, side, itemType, selectedItems, onSelect, noActions } = this.props
		const to = '/dashboard/' + side + '/' + itemType + '/' + item.id
		const ImagCell = noActions ? TableCell : RRTableCell

		return (
			<TableRow
				key={item.ipfs || index}
				selected={selectedItems[item.ipfs]}
			>
				{selectMode &&
					<TableCell padding="checkbox">
						<Checkbox
							// indeterminate={numSelected > 0 && numSelected < rowCount}
							checked={selectedItems[item.ipfs]}
							onChange={(event) => {
								onSelect(item.ipfs, event.target.checked)
							}}
						/>
					</TableCell>
				}
				<ImagCell
					to={to}
				>
					<Img
						className={classnames(classes.cellImg)}
						src={item.mediaUrl || item.fallbackMediaiUrl || ''}
						alt={item.title}
					/>
				</ImagCell>
				<RRTableCell
					// className={tableTheme.link}
					to={to}
				>
					{item.title}
				</RRTableCell>
				<TableCell> {item.type} </TableCell>
				<TableCell> {moment(item.created).format('DD-MM-YYYY')} </TableCell>
				{!noActions &&
					<TableCell>

						<Tooltip
							title={t('LABEL_VIEW')}
							// placement='top'
							enterDelay={1000}
						>
							<RRButton
								to={to}
								variant='contained'
								color='primary'
							>
								{t('LABEL_VIEW')}
							</RRButton>
						</Tooltip>
						{this.renderActions(item, to)}
					</TableCell>
				}
			</TableRow>
		)
	}

	renderActions = (item) => {
		const {
			parentItem,
			t,
			account,
			actions,
			itemType
		} = this.props
		const itemName = item.title
		const itemTypeName = t(itemType, { isProp: true })
		const isDemo = account.wallet.address === 'demo'

		return (
			<span>
				{!item.archived &&
					<Tooltip
						title={t('TOOLTIP_ARCHIVE')}
						// placement='top'
						enterDelay={1000}
					>
						<IconButton
							disabled={isDemo}
							// label={t('ARCHIVE')}
							// className={RTButtonTheme.danger}
							onClick={actions.confirmAction.bind(this,
								actions.archiveItem.bind(this, { item: item, authSig: account.wallet.authSig }),
								null,
								{
									confirmLabel: t('CONFIRM_YES'),
									cancelLabel: t('CONFIRM_NO'),
									text: t('ARCHIVE_ITEM', { args: [itemTypeName, itemName] }),
									title: t('CONFIRM_SURE')
								})}
						>
							<ArchiveIcon />
						</IconButton>
					</Tooltip>
				}
				{item.archived &&
					<Tooltip
						title={t('TOOLTIP_UNARCHIVE')}
						enterDelay={1000}
					// placement='top'
					>
						<IconButton
							disabled={isDemo}
							// label={t('UNARCHIVE')}
							color='secondary'
							onClick={actions.confirmAction.bind(this,
								actions.unarchiveItem.bind(this, { item: item, authSig: account.wallet.authSig }),
								null,
								{
									confirmLabel: t('CONFIRM_YES'),
									cancelLabel: t('CONFIRM_NO'),
									text: t('UNARCHIVE_ITEM', { args: [itemType, itemName] }),
									title: t('CONFIRM_SURE')
								})}
						>
							<UnarchiveIcon />
						</IconButton>
					</Tooltip>
				}
				} */}
			</span>
		)
	}

	renderRows = (items) =>
		<Rows
			padding={this.props.padding}
			side={this.props.side}
			rows={items}
			itemType={this.props.itemType}
			rowRenderer={this.renderTableRow}
			tableHeadRenderer={this.renderTableHead}
			padding='default'
		/>

	renderCards = (items) => {
		return (<List
			itemRenderer={this.renderCard}
			list={items}
			side={this.props.side}
			itemType={this.props.itemType}
		/>)
	}

	render() {
		const {
			items,
			viewModeId,
			side,
			noControls,
			classes,
			...rest
		} = this.props

		if (noControls) {
			return this.renderRows(items)
		}
		return (
			<ListWithControls
				{...rest}
				items={items}
				viewModeId={viewModeId}
				archive
				renderRows={this.renderRows}
				renderCards={this.renderCards}
			/>
		)
	}
}

ItemsList.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired,
	items: PropTypes.array.isRequired,
	viewModeId: PropTypes.string.isRequired,
	header: PropTypes.string,
	objModel: PropTypes.func.isRequired,
	itemType: PropTypes.string.isRequired,
	sortProperties: PropTypes.array.isRequired,
	selectedItems: PropTypes.object,
	selectMode: PropTypes.bool,
	onSelect: PropTypes.func,
	noControls: PropTypes.bool,
	noActions: PropTypes.bool
}

function mapStateToProps(state, props) {
	const persist = state.persist
	const memory = state.memory
	return {
		account: persist.account,
		side: memory.nav.side,
		selectedItems: props.selectedItems || {}
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(withStyles(styles)(ItemsList)))
