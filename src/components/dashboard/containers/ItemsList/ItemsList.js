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
		return (
			<Card
				key={item.ipfs}
				item={item}
				name={item.type}
				logo={item.mediaUrl || item.fallbackMediaUrl}
				side={this.props.side}
				remove={null}
				itemType={this.props.itemType}
				renderActions={() => this.renderActions(item)}
			/>
		)
	}

	renderTableHead = ({ selected }) => {
		const t = this.props.t
		return (
			<TableHead>
				<TableRow>
					<TableCell>
						{selected.length &&
							<Tooltip
								title={t('DELETE_ALL')}
								// placement='top'
								enterDelay={1000}
							>
								<Button
									// icon='delete'
									onClick={null}
								>
									{t('DELETE_ALL')}
								</Button >
							</Tooltip>

						}
					</TableCell>
					<TableCell> {t('PROP_NAME')} </TableCell>
					<TableCell> {t('PROP_ADTYPE')} </TableCell>
					<TableCell> {t('PROP_CREATEDON')} </TableCell>
					<TableCell> {t('ACTIONS')} </TableCell>
				</TableRow>
			</TableHead>
		)
	}

	renderTableRow = (item, index, { to, selected }) => {
		const { t, classes } = this.props
		return (
			<TableRow
				key={item.ipfs || index}
				selected={selected}
			>
				<RRTableCell
					// className={tableTheme.link}
					to={to}
				// theme={tableTheme}
				>
					<Img
						className={classnames(classes.cellImg)}
						src={item.mediaUrl || item.fallbackMediaiUrl  || ''}
						alt={item.title}
					/>
				</RRTableCell>
				<RRTableCell
					// className={tableTheme.link}
					to={to}
				>
					{item.title}
				</RRTableCell>
				<TableCell> {item.type} </TableCell>
				<TableCell> {moment(item.created).format('DD-MM-YYYY')} </TableCell>
				<TableCell>
					<Tooltip
						title={t('LABEL_VIEW')}
						// placement='top'
						enterDelay={1000}
					>
						<RRButton
							to={to}
							variant='raised'
							color='primary'
						>
							{t('LABEL_VIEW')}
						</RRButton>
					</Tooltip>
					{this.renderActions(item)}

				</TableCell>
			</TableRow>
		)
	}

	renderActions = (item) => {
		const {
			parentItem,
			t,
			account,
			actions,
		} = this.props
		const parentName = parentItem ? parentItem.title : ''
		const itemName = item.title
		const itemTypeName = t(ItemTypesNames[item._type], { isProp: true })
		const isDemo = account.wallet.address === 'demo'

		return (
			<span>
				{!item._archived &&
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
				{item._archived &&
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
									text: t('UNARCHIVE_ITEM', { args: [itemTypeName, itemName] }),
									title: t('CONFIRM_SURE')
								})}
						>
							<UnarchiveIcon />
						</IconButton>
					</Tooltip>
				}
				{(this.props.removeFromItem && parentItem) &&
					<Tooltip
						title={t('REMOVE_FROM', { args: [parentName] })}
						// placement='top'
						enterDelay={1000}
					>
						<IconButton
							disabled={isDemo}
							icon='remove_circle_outline'
							label={t('REMOVE_FROM', { args: [parentName] })}
							// className={RTButtonTheme.danger}
							onClick={actions.confirmAction.bind(this,
								actions.removeItemFromItem.bind(this, { item: item, toRemove: parentItem, authSig: account.wallet.authSig }),
								null,
								{
									confirmLabel: t('CONFIRM_YES'),
									cancelLabel: t('CONFIRM_NO'),
									text: t('REMOVE_ITEM', { args: [itemTypeName, itemName, t(ItemTypesNames[parentItem._type], { isProp: true }), parentName] }),
									title: t('CONFIRM_SURE')
								})}
						>
							<RemoveCircleOutlineIcon />
						</IconButton>
					</Tooltip>
				}

				{(this.props.addToItem && parentItem) &&
					<Tooltip
						tile={t('ADD_TO', { args: [parentName] })}
						// placement='top'
						enterDelay={1000}
					>
						<IconButton
							disabled={isDemo}
							label={t('ADD_TO', { args: [parentName] })}
							color='secondary'
							onClick={actions.addItemToItem.bind(this, { item: item, toAdd: this.props.parentItem, authSig: account.wallet.authSig })}
						>
							<AddCircleOutlineIcon />
						</IconButton>
					</Tooltip>
				}
			</span>
		)
	}

	renderRows = (items) =>
		<Rows
			side={this.props.side}
			item={items}
			rows={items}
			itemType={this.props.itemType}
			// multiSelectable={false}
			// selectable={false}
			rowRenderer={this.renderTableRow}
			tableHeadRenderer={this.renderTableHead}
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
		return (
			<ListWithControls
				{...this.props}
				items={this.props.items}
				viewModeId={this.props.viewModeId}
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
	header: PropTypes.string.isRequired,
	objModel: PropTypes.func.isRequired,
	itemType: PropTypes.string.isRequired,
	sortProperties: PropTypes.array.isRequired
}

function mapStateToProps(state, props) {
	const persist = state.persist
	const memory = state.memory
	return {
		account: persist.account,
		side: memory.nav.side,
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
)(withStyles(styles)((Translate(ItemsList))))
