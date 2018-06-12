import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './../theme.css'
import NewTransactionHoc from './TransactionHoc'
import { FontIcon } from 'react-toolbox/lib/font_icon'
import { BidInfo } from './BidsCommon'
import { getBidVerificationReport } from 'services/adex-node/actions'
import { PropRow, ContentBox, FullContentSpinner } from 'components/common/dialog/content'
import Checkbox from 'react-toolbox/lib/checkbox'

class VerifyBid extends Component {
    constructor(props) {
        super(props)
        this.state = {
            errMsg: null,
            errArgs: [],
            // TODO: give this option to publisher only if the bid is verified by advertiser first!
            targetReached: props.placedBid.clicksCount >= props.placedBid._target,
        }
    }

    componentWillMount() {
        const placedBid = this.props.placedBid

        if (!this.props.transaction.report) {

            const verifyType = this.props.verifyType

            let isValidConversion = true
            let conversionWarningMsg = ''
            let conversionCheckMsg = ''
            if (verifyType === 'verify') {
                isValidConversion = this.state.targetReached
                conversionWarningMsg = 'WARNING_NO_TARGET_REACHED_VERIFY'
                conversionCheckMsg = 'WARNING_NO_TARGET_REACHED_VERIFY_CHECKBOX'
            } else if (verifyType === 'giveup') {
                isValidConversion = !this.state.targetReached
                conversionWarningMsg = 'WARNING_TARGET_REACHED_GIVEUP'
                conversionCheckMsg = 'WARNING_TARGET_REACHED_GIVEUP_CHECKBOX'
            } else if (verifyType === 'refund') {
                isValidConversion = !this.state.targetReached
                conversionWarningMsg = 'WARNING_TARGET_REACHED_REFUND'
                conversionCheckMsg = 'WARNING_TARGET_REACHED_REFUND_CHECKBOX'
            }

            this.props.actions.updateSpinner(this.props.trId, true)
            this.props.validate('conversion', { isValid: isValidConversion, err: { msg: 'ERR_NO_TARGET_REACHED' }, dirty: false })
            this.props.validate('report', { isValid: false, err: { msg: 'ERR_UNIT_INFO_NOT_READY' }, dirty: false })

            this.props.handleChange('isValidConversion', isValidConversion)
            this.props.handleChange('conversionWarningMsg', conversionWarningMsg)
            this.props.handleChange('conversionCheckMsg', conversionCheckMsg)

            getBidVerificationReport({ bidId: placedBid._id, authSig: this.props.account._authSig })
                .then((report) => {
                    this.props.handleChange('placedBid', placedBid)
                    this.props.handleChange('account', this.props.acc)
                    this.props.handleChange('report', report)
                    this.props.handleChange('side', this.props.side)
                    this.props.actions.updateSpinner(this.props.trId, false)

                    this.props.validate('report', { isValid: true, dirty: false })
                })
                .catch((err) => {
                    this.props.actions.updateSpinner(this.props.trId, false)
                    this.setState({ errMsg: 'ERR_TRANSACTION', errArgs: [err] })
                    this.props.actions
                        .addToast({ type: 'warning', action: 'X', label: this.props.t('ERR_GETTING_BID_REPORT', { args: [err] }), timeout: 5000 })
                })
        }
    }

    validateConversion = (accepted) => {
        this.props.validate('conversion', { isValid: accepted, dirty: false })
    }

    ConversionConfirm = () => {
        const t = this.props.t
        const errConversion = this.props.invalidFields['conversion'] || null

        return (
            <PropRow
                classNameLeft={theme.warning}
                classNameRight={theme.warning}
                style={{ width: '100%' }}
                left={<span> <FontIcon value='warning' /> </span>}
                right={
                    <div>
                        <div> {t(this.props.transaction.conversionWarningMsg)} </div>
                        <br />
                        <Checkbox
                            checked={!errConversion}
                            label={t(this.props.transaction.conversionCheckMsg)}
                            onChange={this.validateConversion}
                        />
                    </div>
                }
            />
        )
    }

    render() {
        const tx = this.props.transaction
        const t = this.props.t
        const bid = this.props.placedBid || {}

        return (
            <ContentBox>
                {!!this.props.spinner ?
                    <FullContentSpinner />
                    :
                    <BidInfo
                        bid={bid}
                        t={t}
                        report={tx.report}
                        errMsg={this.state.errMsg}
                        errArgs={this.state.errArgs}
                        stickyTop={!tx.isValidConversion ? <this.ConversionConfirm /> : null}
                    />
                }
            </ContentBox>
        )
    }
}

VerifyBid.propTypes = {
    actions: PropTypes.object.isRequired,
    label: PropTypes.string,
    trId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    transaction: PropTypes.object.isRequired,
    account: PropTypes.object.isRequired,
    placedBid: PropTypes.object.isRequired,
    spinner: PropTypes.bool,
}

function mapStateToProps(state, props) {
    // let persist = state.persist
    const memory = state.memory
    const trId = props.stepsId
    return {
        spinner: memory.spinners[trId],
        side: memory.nav.side,
        trId: trId

    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(actions, dispatch)
    }
}

const VerifyBidForm = NewTransactionHoc(VerifyBid)
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(VerifyBidForm)
