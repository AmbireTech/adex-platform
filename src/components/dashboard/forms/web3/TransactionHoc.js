import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Button, IconButton } from 'react-toolbox/lib/button'
// import theme from './theme.css'
import Input from 'react-toolbox/lib/input'
import { Bid } from 'adex-models'
import Translate from 'components/translate/Translate'
import { encrypt } from 'services/crypto/crypto'
import scActions from 'services/smart-contracts/actions'

const { placeBidAuction } = scActions

export default function NewTransactionHoc(Decorated) {
    // TODO: make it common for bids and items
    class TransactionHoc extends Component {
        componentWillMount() {
        }

        handleChange = (name, value) => {
            this.props.actions.updateNewTransaction({ trId: this.props.trId, key: name, value: value })
        }

        onSave = (err, trans) => {
            if (typeof this.props.onSave === 'function') {
                this.props.onSave()
            }

            if (Array.isArray(this.props.onSave)) {
                for (var index = 0; index < this.props.onSave.length; index++) {
                    if (typeof this.props.onSave[index] === 'function') {
                        this.props.onSave[index]()
                    }
                }
            }

            this.props.actions.resetNewTransaction({trId: this.props.trId})

            if(trans){
                let trData = {...trans}
                trData.status = 'TRANSACTION_STATUS_SENT'
                trData.sendingTime = Date.now()
                this.props.actions.addWeb3Transaction({trans: trData, addr: this.props.account._addr})
            }            
        }

        save = () => {
            const t = this.props.t


            this.props.saveFn({ acc: this.props.account, transaction: this.props.transaction })
                .then((res) => {
                    this.props.actions.addToast({ type: 'accept', action: 'X', label: t('TRANSACTION_SENT_MSG', {args: [res.trHash]}), timeout: 5000 })
                    this.onSave(null, res)
                })
                .catch((err) => {
                    this.props.actions.addToast({ type: 'cancel', action: 'X', label: t('ERR_TRANSACTION', {args: [err]}), timeout: 5000 })
                    this.onSave(err, null)
                })

        }

        render() {
            let transaction = this.props.transaction || {}
            let props = this.props

            return (
                <Decorated {...props} transaction={transaction} save={this.save} handleChange={this.handleChange} />
            )
        }
    }

    TransactionHoc.propTypes = {
        actions: PropTypes.object.isRequired,
        label: PropTypes.string,
        trId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        transaction: PropTypes.object.isRequired,
        account: PropTypes.object.isRequired,
        saveFn: PropTypes.func
    }

    function mapStateToProps(state, props) {
        let persist = state.persist
        let memory = state.memory
        return {
            account: persist.account,
            transaction: memory.newTransactions[props.trId] || {},
        }
    }

    function mapDispatchToProps(dispatch) {
        return {
            actions: bindActionCreators(actions, dispatch)
        }
    }

    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(Translate(TransactionHoc))
}
