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
import { getAccountStats } from 'services/smart-contracts/actions/registry'
import { MULT } from 'services/smart-contracts/constants'

// console.log('actions', actions)
class Account extends React.Component {
    state = {
    }

    componentWillMount(nextProps) {
        getAccountStats({ _addr: this.props.account._addr })
            .then((stats) => {
                this.props.actions.updateAccount({ ownProps: { stats: stats } })
            })
    }


    render() {
        let account = this.props.account
        let stats = account._stats

        if (!stats) {
            return null
        }

        return (
            <div>
                <Grid fluid>
                    <Row>
                        <Col xs={12} lg={3} className={theme.textRight}>{this.props.t('ACCOUNT_ETH_ADDR')}:</Col>
                        <Col xs={12} lg={3} className={theme.textLeft}><strong> {account._addr} </strong> </Col>
                    </Row>
                    <Row>
                        <Col xs={12} lg={3} className={theme.textRight}>{this.props.t('ACCOUNT_IS_REGISTERED')}:</Col>
                        <Col xs={12} lg={3} className={theme.textLeft}>{stats.isRegistered.toString()}</Col>
                    </Row>
                    <Row>
                        <Col xs={12} lg={3} className={theme.textRight}>{this.props.t('ACCOUNT_ETH_BALANCE')}:</Col>
                        <Col xs={12} lg={3} className={theme.textLeft}>{web3.utils.fromWei(stats.balanceEth, 'ether')}</Col>
                    </Row>
                    <Row>
                        <Col xs={12} lg={3} className={theme.textRight}>{this.props.t('ACCOUNT_ADX_BALANCE')}:</Col>
                        <Col xs={12} lg={3} className={theme.textLeft}>{stats.balanceAdx / MULT}</Col>
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
