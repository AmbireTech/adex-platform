import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import IdentityHoc from './IdentityHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import GasPrice from 'components/dashboard/account/GasPrice'
import { getDeployTx, getRandomAddressForDeployTx } from 'services/idenity/contract-address'
import { cfg, getWeb3, web3Utils } from 'services/smart-contracts/ADX'
import { sendTx, signTypedMsg } from 'services/smart-contracts/actions/web3'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

class IdentityContractAddressEthTransaction extends Component {

    constructor(props, context) {
        super(props, context)
        this.state = {
        }
    }

    deployIdentity = () => {
        const { identity } = this.props
        const txData = { ...identity.identityContractTxData }
        const tx = { ...txData.tx }
        tx.chainId = 42 // temp for test
        tx.from = identity.identityContractOwner

        getWeb3('metamask')
            .then(({ web3 }) => {
                return web3.eth.sendTransaction(tx)
            }).then((receipt) => {
                console.log('receipt', receipt)
            }).catch((err) => {
                console.log(err)
            })
    }

    render() {
        const { identity, t, classes, handleChange } = this.props
        const { identityContractAddress } = identity || {}

        return (
            <div>
                <Grid
                    container
                    spacing={16}
                >
                    <Grid item sm={6}>
                        <Button
                            onClick={this.deployIdentity}
                        >
                            {'SEND_IDENTITY_TX'}
                        </Button>
                        <div>
                            {identityContractAddress || ''}
                        </div>

                    </Grid>
                </Grid>
            </div >
        )
    }
}

IdentityContractAddressEthTransaction.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired
}

function mapStateToProps(state) {
    let persist = state.persist
    // let memory = state.memory
    return {
        account: persist.account,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

const IdentityContractAddressStep = IdentityHoc(IdentityContractAddressEthTransaction)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(withStyles(styles)(IdentityContractAddressStep)))