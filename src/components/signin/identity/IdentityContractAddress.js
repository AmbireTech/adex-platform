import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import IdentityHoc from './IdentityHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import { getDeployTx, getRandomAddressForDeployTx } from 'services/idenity/contract-address'
import { tokens } from 'services/smart-contracts/tokensConfig'

const RELAYER_ADDR = '0x0A8fe6e91eaAb3758dF18f546f7364343667E957'

class IdentityContractAddress extends Component {

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
        const { identityContractOwner } = this.props.identity

        const deployTx = getDeployTx({
            addr: identityContractOwner,
            privLevel: 3,
            feeTokenAddr: this.props.identity.feeTokenAddr, // '0x4470BB87d77b963A013DB939BE332f927f2b992e',
            feeBeneficiery: RELAYER_ADDR,
            feeTokenAmount: '10000'
        })

        const addrData = getRandomAddressForDeployTx({ deployTx })
        this.props.handleChange('identityContractAddress', addrData.idContractAddr)
        this.props.validate('identityContractAddress', {
            isValid: !!addrData.idContractAddr,
            err: { msg: 'ERR_NO_IDENTITY_CONTRACT_ADDRESS' },
            dirty: true
        })
    }

    tokenSelect = () =>
        <FormControl >
            <InputLabel htmlFor='fee-token'>Fee Token</InputLabel>
            <Select
                value={this.props.identity.feeTokenAddr || ''}
                onChange={(event) => this.props.handleChange('feeTokenAddr', event.target.value)}
                inputProps={{
                    name: 'fee-token',
                    id: 'fee-token',
                }}
            >
                <MenuItem value=''>
                    <em>None</em>
                </MenuItem>
                {tokens.map((token) =>
                    <MenuItem key={token.symbol}  value={token.contractAddress.kovan}>
                        {token.symbol}
                    </MenuItem>
                )}
            </Select>
        </FormControl>

    render() {
        const { identity, t } = this.props
        const { extraEntropyIdentityContract, identityContractAddress } = identity || {}

        return (
            <div>
                <Grid
                    container
                    spacing={16}
                >
                    <Grid item sm={6}>
                        <this.tokenSelect />
                    </Grid>
                    <Grid item sm={6}>
                        <TextField
                            fullWidth
                            type='text'
                            required
                            label={t('extraEntropyIdentityContract', { isProp: true })}
                            value={extraEntropyIdentityContract || ''}
                            onChange={(ev) => this.props.handleChange('extraEntropyIdentityContract', ev.target.value)}
                        />
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

IdentityContractAddress.propTypes = {
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

const IdentityContractAddressStep = IdentityHoc(IdentityContractAddress)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Translate(IdentityContractAddressStep))