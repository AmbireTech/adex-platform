import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import NewTransactionHoc from './TransactionHoc'
import { BidInfo } from './BidsCommon'
import { getBidVerificationReport } from 'services/adex-node/actions'
import { PropRow, ContentBox, FullContentSpinner } from 'components/common/dialog/content'
import Checkbox from '@material-ui/core/Checkbox'
import WarningIcon from '@material-ui/icons/Warning'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { styles } from './styles.js'
import { withStyles } from '@material-ui/core/styles'

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
        const { t, transaction, placedBid, validate, handleChange, actions, trId, account, acc, side, verifyType } = this.props

        if (!transaction.report) {
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

            actions.updateSpinner(trId, true)
            validate('conversion', { isValid: isValidConversion, err: { msg: 'ERR_NO_TARGET_REACHED' }, dirty: false })
            validate('report', { isValid: false, err: { msg: 'ERR_UNIT_INFO_NOT_READY' }, dirty: false })

            handleChange('isValidConversion', isValidConversion)
            handleChange('conversionWarningMsg', conversionWarningMsg)
            handleChange('conversionCheckMsg', conversionCheckMsg)

            getBidVerificationReport({ bidId: placedBid._id, authSig: account._authSig })
                .then((report) => {
                    handleChange('placedBid', placedBid)
                    handleChange('account', acc)
                    handleChange('report', report)
                    handleChange('side', side)
                    actions.updateSpinner(trId, false)

                    validate('report', { isValid: true, dirty: false })
                })
                .catch((err) => {
                    actions.updateSpinner(trId, false)
                    this.setState({ errMsg: 'ERR_TRANSACTION', errArgs: [err] })
                    actions
                        .addToast({ type: 'warning', action: 'X', label: t('ERR_GETTING_BID_REPORT', { args: [err] }), timeout: 5000 })
                })
        }
    }

    validateConversion = (accepted) => {
        this.props.validate('conversion', { isValid: accepted, dirty: false })
    }

    ConversionConfirm = () => {
        const { t, classes, invalidFields } = this.props
        const errConversion = invalidFields['conversion'] || null

        return (
            <PropRow
                classNameLeft={classes.warning}
                classNameRight={classes.warning}
                style={{ width: '100%' }}
                left={<span> <WarningIcon /> </span>}
                right={
                    <div>
                        <div> {t(this.props.transaction.conversionWarningMsg)} </div>
                        <br />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    color="default"
                                    checked={!errConversion}
                                    onChange={(ev) => this.validateConversion(ev.target.checked)}
                                />
                            }
                            label={t(this.props.transaction.conversionCheckMsg)}
                        />
                    </div>
                }
            />
        )
    }

    render() {
        const { t, transaction, placedBid = {} } = this.props

        return (
            <ContentBox>
                {!!this.props.spinner ?
                    <FullContentSpinner />
                    :
                    <BidInfo
                        bid={placedBid}
                        t={t}
                        report={transaction.report}
                        errMsg={this.state.errMsg}
                        errArgs={this.state.errArgs}
                        stickyTop={!transaction.isValidConversion ? <this.ConversionConfirm /> : null}
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
    // const persist = state.persist
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
)(withStyles(styles)(VerifyBidForm))
