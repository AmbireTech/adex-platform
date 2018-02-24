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

class AuthenticateStepGetToken extends Component {
    componentWillMount() {
        this.getToken()
    }

    render() {
        let tr = this.props.transaction
        let t = this.props.t

        return (
            <div>
                <h1> {this.props.transaction.authToken} </h1>
            </div>
        )
    }
}

AuthenticateStepGetToken.propTypes = {
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

let AuthenticateStepGetTokenForm = NewTransactionHoc(AuthenticateStepGetToken)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AuthenticateStepGetTokenForm)
