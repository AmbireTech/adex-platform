import React from 'react'
import theme from './theme.css'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import moment from 'moment'
import Translate from 'components/translate/Translate'
import Img from 'components/common/img/Img'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { web3 } from 'services/smart-contracts/ADX'
import { setWallet } from 'services/smart-contracts/actions/web3'

// console.log('actions', actions)
class Account extends React.Component {
    state = {
    }

    componentWillMount(nextProps) {
    }

    render() {
        let account = this.props.account

        let isRegisterd = false
        return (
            <div>
                <Grid fluid>
                    <Row>
                        <Col xs={12} lg={3} className={theme.textRight}>{this.props.t('ACCOUNT_ETH_ADDR')}:</Col>
                        <Col xs={12} lg={3} className={theme.textLeft}><strong> {account._addr} </strong> </Col>
                    </Row>
                    <Row>
                        <Col xs={12} lg={3} className={theme.textRight}>{this.props.t('ACCOUNT_IS_REGISTERED')}:</Col>
                        <Col xs={12} lg={3} className={theme.textLeft}>{isRegisterd}</Col>
                    </Row>
                    <Row>
                        <Col xs={12} lg={3} className={theme.textRight}>{this.props.t('ACCOUNT_ETH_BALANCE')}:</Col>
                        <Col xs={12} lg={3} className={theme.textLeft}>{0}</Col>
                    </Row>
                    <Row>
                        <Col xs={12} lg={3} className={theme.textRight}>{this.props.t('ACCOUNT_ADX_BALANCE')}:</Col>
                        <Col xs={12} lg={3} className={theme.textLeft}>{0}</Col>
                    </Row>
                </Grid>
            </div>
        )
    }
}

Account.propTypes = {
    actions: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
    let persist = state.persist
    // let memory = state.memory
    let account = persist.account
    return {
        account: account
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
)(Translate(Account))
