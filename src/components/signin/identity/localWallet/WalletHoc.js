import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'

export default function WalletHoc(Decorated) {

    class Wallet extends Component {
        constructor(props) {
            super(props)

            this.save = this.save.bind(this);

            this.state = {
                wallet: {},
                ready: false
            }
        }

        componentWillReceiveProps(nextProps) {
            this.setState({ wallet: nextProps.wallet })
        }

        componentWillMount() {
            this.setState({ wallet: this.props.wallet })
        }

        handleChange = (prop, value) => {
            this.props.actions.updateWallet(prop, value)
        }

        save = () => {
            console.log('wallet', this.state.wallet)
        }

        render() {
            const props = this.props
            const { wallet } = this.state

            return (
                <Decorated {...props} wallet={wallet} save={this.save} handleChange={this.handleChange} />
            )
        }
    }

    Wallet.propTypes = {
        actions: PropTypes.object.isRequired,
        account: PropTypes.object.isRequired,
        wallet: PropTypes.object.isRequired
    }

    function mapStateToProps(state, props) {
        let persist = state.persist
        let memory = state.memory
        return {
            account: persist.account,
            wallet: memory.wallet
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
    )(Wallet)
}

