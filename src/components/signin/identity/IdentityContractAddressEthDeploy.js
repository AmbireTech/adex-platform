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
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

class IdentityContractAddressEthDeploy extends Component {

    constructor(props, context) {
        super(props, context)
        this.state = {
        }
    }

    componentDidMount() {
        this.props.validate('identityContractAddress', {
            isValid: !!this.props.identity.identityContractAddress,
            err: { msg: 'ERR_NO_IDENTITY_CONTRACT_ADDRESS' },
            dirty: false
        })
    }

    getIdentityContracAddress = () => {
        const  identityContractOwner  = this.props.identity.account.addr
        // TODO: deployTx.gasPrice

        const deployTx = getDeployTx({
            addr: identityContractOwner,
            privLevel: 3,
            feeTokenAddr: identityContractOwner,
            feeBeneficiary: identityContractOwner,
            feeTokenAmount: '0'
        })

        const addrData = getRandomAddressForDeployTx({ deployTx })
        this.props.handleChange('identityContractAddress', addrData.idContractAddr)
        this.props.handleChange('identityContractTxData', addrData)
        this.props.validate('identityContractAddress', {
            isValid: !!addrData.idContractAddr,
            err: { msg: 'ERR_NO_IDENTITY_CONTRACT_ADDRESS' },
            dirty: true
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
                        <GasPrice />
                    </Grid>
                    <Grid item sm={6}>
                        <Button
                            onClick={this.getIdentityContracAddress}
                        >
                            {'Get addr'}
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

IdentityContractAddressEthDeploy.propTypes = {
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

const IdentityContractAddressStep = IdentityHoc(IdentityContractAddressEthDeploy)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(withStyles(styles)(IdentityContractAddressStep)))