import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import ItemsList from './ItemsList'
import theme from './theme.css'
import classnames from 'classnames'
import { getItems } from 'services/adex-node/actions'
import { Models } from 'adex-models'
import { items as ItemsConstants } from 'adex-constants'
import Rows from 'components/dashboard/collection/Rows'
import { Table, TableHead, TableRow, TableCell } from 'react-toolbox/lib/table'
import Translate from 'components/translate/Translate'

const { ItemTypesNames } = ItemsConstants

const SORT_PROPERTIES = [
    { value: '_id', label: '' },
    { value: '_status', label: '' },
]


class Transactions extends Component {

    renderTableHead() {
        let t = this.props.t
        return (
            <TableHead>
                <TableCell> {t('TRANS_ID')} </TableCell>
            </TableHead>
        )
    }

    // TODO: make something common with unit bids 
    renderTableRow(transaction, index, { to, selected }) {
        if(!transaction) return null

        let t = this.props.t

        return (
            <TableRow key={transaction._id || index}>
                <TableCell
                    className={classnames(theme.compactCol, theme.ellipsis)}
                >
                    {transaction._id}
                    <a target='_blank' href={process.env.ETH_SCAN_ADDR_HOST + transaction._advertiser} > {transaction._advertiser} </a>
                </TableCell>

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
            (transaction._status || '') +
            (transaction._time || '')
    }

    render() {
        let t = this.props.t
        let items = Array.from(Object.values(this.props.transactions || {})) || []
        let itemsCount = (items.filter((i) => !!i && !!i._id).length)

        return (
            <div>
                <div className={classnames(theme.heading, theme.Transactions, theme.items)}>
                    <h2 > {t('TRANSACTIONS')} {'(' + itemsCount + ')'} </h2>
                </div>

                <ItemsList items={items} listMode='rows' delete renderRows={this.renderRows} sortProperties={SORT_PROPERTIES} searchMatch={this.searchMatch} />
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
        transactions: persist.web3Transactions
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
