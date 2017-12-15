import React from 'react'
import theme from './theme.css'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import moment from 'moment'
import { Button, IconButton } from 'react-toolbox/lib/button'
import Translate from 'components/translate/Translate'
import Img from 'components/common/img/Img'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { web3 } from 'services/smart-contracts/ADX'
import { MULT } from 'services/smart-contracts/constants'
import NewItemWithDialog from 'components/dashboard/forms/NewItemWithDialog'
import Input from 'react-toolbox/lib/input'
import { APPROVE } from 'components/dashboard/account/forms/transactions'

import scActions from 'services/smart-contracts/actions'
const { getAccountStats, approveTokens } = scActions

// console.log('actions', actions)
class Account extends React.Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            allowence: 0
        }

        this.subscription = null
        this.syncing = null
        this.logs = null
    }

    componentWillMount(nextProps) {
        this.getStats()
    }

    componentWillUnmount() {
        // web3.eth.clearSubscriptions()
    }

    getStats = () => {
        getAccountStats({ _addr: this.props.account._addr })
            .then((stats) => {
                this.props.actions.updateAccount({ ownProps: { stats: stats } })
            })
    }

    stats = () => {

    }

    register = () => {

    }

    approve = () => {
        approveTokens({ _addr: this.props.account._addr, amountToApprove: this.state.allowence })
            .then(() => {
                this.getStats()
            })
    }

    ApproveForm = () =>
        // TODO: Make it in separate file and add validations
        <div>
            <Input
                type='number'
                required
                label={this.props.t('TOKENS_TO_APPROVE')}
                name='name'
                value={this.state.allowence}
                onChange={(value) => this.setState({ allowence: value })}
            />
            <Button
                label={this.props.t('APPROVE_TOKENS')}
                onClick={this.approve}
            />
        </div>


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
                        <Col xs={12} lg={4} className={theme.textRight}>{this.props.t('ACCOUNT_ETH_ADDR')}:</Col>
                        <Col xs={12} lg={8} className={theme.textLeft}><strong> {account._addr} </strong> </Col>
                    </Row>
                    <Row>
                        <Col xs={12} lg={4} className={theme.textRight}>{this.props.t('ACCOUNT_IS_REGISTERED')}:</Col>
                        <Col xs={12} lg={8} className={theme.textLeft}>{stats.isRegistered.toString()}</Col>
                    </Row>
                    <Row>
                        <Col xs={12} lg={4} className={theme.textRight}>{this.props.t('ACCOUNT_ETH_BALANCE')}:</Col>
                        <Col xs={12} lg={8} className={theme.textLeft}>{web3.utils.fromWei(stats.balanceEth, 'ether')}</Col>
                    </Row>
                    <Row>
                        <Col xs={12} lg={4} className={theme.textRight}>{this.props.t('ACCOUNT_ADX_BALANCE')}:</Col>
                        <Col xs={12} lg={8} className={theme.textLeft}>{stats.balanceAdx / MULT}</Col>
                    </Row>
                    <Row>
                        <Col xs={12} lg={4} className={theme.textRight}>{this.props.t('ACCOUNT_ADX_ALLOWENCE')}:</Col>
                        <Col xs={12} lg={8} className={theme.textLeft}>{stats.allowence / MULT}</Col>
                    </Row>

                    <Row>
                        <APPROVE raised accent />
                        {/* <this.ApproveForm /> */}
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
