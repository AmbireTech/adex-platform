import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import IdentityHoc from './IdentityHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { deployIdentityContract } from 'services/idenity/contract-address'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

class IdentityContractAddressEthTransaction extends Component {

    constructor(props, context) {
        super(props, context)
        this.state = {
            waitingIdentityDeploy: false,
            identityDeployed: false
        }
    }

    skipDeployIdentity = () => {
        // TODO
    }

    deployIdentity = async () => {
        const { identity } = this.props
        const deployData = { ...identity.identityContractTxData }
        const result = await deployIdentityContract({
            deployData,
            authType: 'metamask',
            owner: identity.account.addr
        })

        console.log('result', result)
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
                            {'SEND_IDENTITY_TX_NOW'}
                        </Button>
                        <Button
                            onClick={this.skipDeployIdentity}
                        >
                            {'SEND_IDENTITY_TX_LATER'}
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