import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { cfg } from 'services/smart-contracts/ADX'
import Button from '@material-ui/core/Button'
import Translate from 'components/translate/Translate'
const AirSwap = window.AirSwap

class AirSwapWidget extends Component {
    componentWillMount() {
    }

    onSwap = () => {
        const { t, actions, mode } = this.props
        AirSwap.Trader.render({
            env: 'production',
            mode: mode,
            token: cfg.addr.token,
            onCancel: () => {
                console.info('Trade was canceled.')
            },
            onComplete: (transactionId) => {

                const txData = {
                    trHash: transactionId,
                    trMethod: `TX_MTD_AIRSWAP_${mode.toUpperCase()}`
                }
                actions.addWeb3Transaction({ trans: txData, addr: 'GET_THE_ADDR' })
                actions.addToast({ type: 'accept', action: 'X', label: t('TRANSACTION_SENT_MSG', { args: [transactionId] }), timeout: 5000 })
            }
        }, 'body')
    }

    render() {
        return (
            <Button
                color='primary'
                onClick={this.onSwap}
            >
                {this.props.label}
            </Button>
        )
    }
}

AirSwapWidget.propTypes = {
    actions: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired
}

function mapStateToProps(state, props) {
    const { persist } = state

    return {
        account: persist.account
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
)(Translate(AirSwapWidget))
