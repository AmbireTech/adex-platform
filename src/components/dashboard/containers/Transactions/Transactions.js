import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import ListWithControls from 'components/dashboard/containers/Lists/ListWithControls'
import classnames from 'classnames'
import Rows from 'components/dashboard/collection/Rows'
import TableCellMui from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Translate from 'components/translate/Translate'
import Anchor from 'components/common/anchor/anchor'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import { formatDateTime } from 'helpers/formatters'
import { styles } from './styles'

const SORT_PROPERTIES = [
	{ value: 'sendingTime', label: '' },
	{ value: 'status', label: '' },
	{ value: 'txMethod', label: '' },
	{ value: 'id', label: '' },
]

const TableCell = ({ children, ...rest }) =>
	<TableCellMui
		{...rest}
	>
		{!!children && children}
	</TableCellMui >

class Transactions extends Component {

	componentWillMount() {
		this.props.actions.updateNav('navTitle', this.props.t('TRANSACTIONS'))
	}

	renderTableHead() {
		let t = this.props.t
		return (
			<TableHead>
				<TableRow>
					<TableCell> {t('TRANS_METHOD')} </TableCell>
					<TableCell> {t('TRANS_ID')} </TableCell>
					<TableCell> {t('TRANS_NONCE')} </TableCell>
					<TableCell> {t('TRANS_STATUS')} </TableCell>
					<TableCell> {t('TRANS_SENDING_TIME')} </TableCell>
				</TableRow>
			</TableHead>
		)
	}

	// TODO: make something common with unit bids 
	renderTableRow(transaction, index, { to, selected }) {
		if (!transaction) return null

		let { t, classes } = this.props

		return (
			<TableRow key={transaction.id || index}>
				<TableCell> {t(transaction.txMethod)} </TableCell>
				<TableCell
					className={classnames(classes.compactCol)}
				>
					<Typography noWrap>
						<Anchor target='_blank' href={process.env.ETH_SCAN_TX_HOST + transaction.id} > {transaction.id} </Anchor>
					</Typography>
				</TableCell>
				<TableCell> {transaction.nonce} </TableCell>
				<TableCell> {(transaction.status)} </TableCell>
				<TableCell> {formatDateTime(transaction.sendingTime)} </TableCell>

			</TableRow >
		)
	}

	renderRows = (items) =>
		<Rows
			multiSelectable={false}
			selectable={false}
			side={this.props.side}
			item={items}
			rows={items}
			rowRenderer={this.renderTableRow.bind(this)}
			tableHeadRenderer={this.renderTableHead.bind(this)}
		/>

	searchMatch = (transaction) => {
		return (transaction.id || '') +
			(transaction.status || '') +
			(transaction.bidId || '') +
			(transaction.state || '') +
			(transaction.sendingTime || '')
	}

	render() {
		// let t = this.props.t
		const { transactions } = this.props

		const reduced = Object.keys(transactions).reduce((memo, key) => {
			if (key && ((key.toString()).length === 66)) {
				const itm = { ...transactions[key] }
				itm.id = key
				memo.push(itm)
			}

			return memo
		}, [])

		// let itemsCount = reduced.length

		return (
			<div>
				{/* <div className={classnames(theme.heading, theme.Transactions, theme.items)}>
                    <h2 > {t('TRANSACTIONS')} {'(' + itemsCount + ')'} </h2>
                </div> */}

				<ListWithControls
					items={reduced}
					listMode='rows'
					delete
					renderRows={this.renderRows}
					sortProperties={SORT_PROPERTIES}
					searchMatch={this.searchMatch}
					uiStateId='transactions'
				/>
			</div>
		)
	}
}

Transactions.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired,
	transactions: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
	const { persist } = state
	const { account, web3Transactions } = persist
	// let memory = state.memory
	return {
		account,
		transactions: {
			...(web3Transactions[account.wallet.address] || {}),
			...(web3Transactions[account.identity.address] || {}),
		}
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
)(withStyles(styles)(Translate(Transactions)))
