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
import { getIdentityContractAddress } from 'services/idenity/contract-address'

class IdentityContractAddress extends Component {

    constructor(props, context) {
        super(props, context)
        this.state = {
        }
    }

    componentDidMount() {
        this.props.validate('identityContractAddress', {
            isValid: !!this.props.item.identity_contract_address,
            err: { msg: 'ERR_NO_IDENTITY_CONTRACT_ADDRESS' },
            dirty: false
        })
    }

    getIdentityContracAddress(extraEntropy = '') {
        const addr = getIdentityContractAddress({ extraEntropy })
        this.props.handleChange('identityContractAddress', addr)
        this.props.validate('identityContractAddress', {
            isValid: !!addr,
            err: { msg: 'ERR_NO_IDENTITY_CONTRACT_ADDRESS' },
            dirty: true
        })
    }

    render() {
        const { identity, t } = this.props
        const { extraEntropyIdentityContract, identityContractAddress } = identity
        return (
            <div>
                <Grid
                    container
                    spacing={16}
                >
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            type='text'
                            required
                            label={t('extraEntropyIdentityContract', { isProp: true })}
                            value={extraEntropyIdentityContract || ''}
                        />
                    </Grid>
                    <Grid item sm={12} md={6}>
                        <Button
                            onClick={this.getIdentityContracAddress}
                        />
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
