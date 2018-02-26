import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import ItemsList from './ItemsList'
import theme from './theme.css'
import RTButtonTheme from 'styles/RTButton.css'
import classnames from 'classnames'
import { items as ItemsConstants } from 'adex-constants'
import Rows from 'components/dashboard/collection/Rows'
import { Table, TableHead, TableRow, TableCell } from 'react-toolbox/lib/table'
import Translate from 'components/translate/Translate'
import moment from 'moment'
import { Button, IconButton } from 'react-toolbox/lib/button'
import scActions from 'services/smart-contracts/actions'
const { getTransactionsReceipts } = scActions

const { ItemTypesNames } = ItemsConstants

const SORT_PROPERTIES = [
    { value: 'sendingTime', label: '' },
    { value: 'status', label: '' },
    { value: 'trMethod', label: '' },
    { value: '_id', label: '' },
]


class Transactions extends Component {

    componentWillMount(nextProps) {
        this.checkTransactions()
    }

    checkTransactions = () => {
        let transactions = this.props.transactions
        let hashes = Object.keys(transactions).reduce((memo, key) => {
            if(key && ((key.toString()).length === 66)){
                memo.push(key)
            }
            return memo
        }, [])

        getTransactionsReceipts(hashes)
        .then((receipts)=>{
            receipts.forEach((rec) =>{
                if(rec && rec.transactionHash && rec.status){
                    let status = rec.status === '0x1' ? 'TRANSACTION_STATUS_SUCCESS' : 'TRANSACTION_STATUS_ERROR'
                    this.props.actions.updateWeb3Transaction({ trId: rec.transactionHash, key: 'status', value: status, addr: this.props.account._addr })
                }
            })
        })
    }

    renderTableHead() {
        let t = this.props.t
        return (
            <TableHead>
                <TableCell> {t('TRANS_METHOD')} </TableCell>
                <TableCell> {t('TRANS_ID')} </TableCell>
                <TableCell> {t('TRANS_STATUS')} </TableCell>
                <TableCell> {t('TRANS_SENDING_TIME')} </TableCell>
            </TableHead>
        )
    }

    // TODO: make something common with unit bids 
    renderTableRow(transaction, index, { to, selected }) {
        if(!transaction) return null

        let t = this.props.t

        return (
            <TableRow key={transaction._id || index}>
                <TableCell> {t(transaction.trMethod)} </TableCell>
                <TableCell
                    className={classnames(theme.compactCol, theme.ellipsis)}
                >
                    <a target='_blank' href={process.env.ETH_SCAN_TX_HOST + transaction._id} > {transaction._id} </a>
                </TableCell>
                <TableCell> {t(transaction.status)} </TableCell>
                <TableCell> {t(moment(transaction.sendingTime).format('MMMM Do, YYYY, HH:mm:ss'))} </TableCell>

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
        return (transaction._id || '') +
            (transaction.status || '') +
            (transaction.bidId || '') +
            (transaction.state || '') +
            (transaction.sendingTime || '')
    }

    render() {
        let t = this.props.t
        // let items = Array.from(Object.values(this.props.transactions || {})) || []
        let transactions = this.props.transactions
        let reduced = Object.keys(transactions).reduce((memo, key) => {
            if(key && ((key.toString()).length === 66)){
                let itm = {...transactions[key]}
                itm._id = key
                memo.push(itm)
            }

            return memo
        }, [])

        let itemsCount = reduced.length

        return (
            <div>
                <div className={classnames(theme.heading, theme.Transactions, theme.items)}>
                    <h2 > {t('TRANSACTIONS')} {'(' + itemsCount + ')'} </h2>
                </div>

                <Button
                        floating
                        icon='refresh'
                        primary
                        flat
                        className={classnames(theme.floating)}
                        onClick={this.checkTransactions}
                    />

                <ItemsList items={reduced} listMode='rows' delete renderRows={this.renderRows} sortProperties={SORT_PROPERTIES} searchMatch={this.searchMatch} />
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
    let persist = state.persist
    // let memory = state.memory
    return {
        account: persist.account,
        transactions: persist.web3Transactions[persist.account._addr] || {}
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
)(Translate(Transactions))
