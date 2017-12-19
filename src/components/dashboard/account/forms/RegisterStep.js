import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
// import theme from 'components/dashboard/forms/theme.css'
// import Translate from 'components/translate/Translate'
import NewTransactionHoc from './TransactionHoc'
// import { Grid, Row, Col } from 'react-flexbox-grid'
// import numeral from 'numeral'
import Input from 'react-toolbox/lib/input'
// import { Button, IconButton } from 'react-toolbox/lib/button'

import scActions from 'services/smart-contracts/actions'
const { registerAccountEstimateGas } = scActions

class RegisterStep extends Component {
    estimateGas() {
        this.props.actions.updateSpinner(this.props.trId, true)
        registerAccountEstimateGas({
            _addr: this.props.account._addr,
            prKey: this.props.account._temp.privateKey
        })
            .then((res) => {
                this.props.actions.updateNewTransaction({ trId: this.props.trId, key: 'gas', value: res })
                this.props.actions.updateSpinner(this.props.trId, false)
            })
        // TODO: catch
    }

    componentWillUnmount() {
        this.estimateGas()
    }

    render() {
        let tr = this.props.transaction
        let t = this.props.t

        return (
            <div>
                <Input
                    type='text'
                    required
                    label={this.props.t('ACCOUNT_NAME')}
                    name='name'
                    value={tr.name || ''}
                    onChange={(value) => this.props.handleChange('name', value)}
                />
            </div>
        )
    }
}

RegisterStep.propTypes = {
    actions: PropTypes.object.isRequired,
    label: PropTypes.string,
    trId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    transaction: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    let persist = state.persist
    let memory = state.memory
    return {
        // trId: 'approve'
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

let RegisterStepForm = NewTransactionHoc(RegisterStep)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RegisterStepForm)
