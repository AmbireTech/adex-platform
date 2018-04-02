import { cfg, getWeb3, web3Utils } from 'services/smart-contracts/ADX'
import { sendTx, signTypedMsg } from 'services/smart-contracts/actions/web3'
import { GAS_PRICE, MULT, DEFAULT_TIMEOUT } from 'services/smart-contracts/constants'
import { toHexParam, adxAmountStrToHex, adxAmountStrToPrecision, getRsvFromSig, getTypedDataHash } from 'services/smart-contracts/utils'
import { encrypt } from 'services/crypto/crypto'
import { exchange as EXCHANGE_CONSTANTS } from 'adex-constants'
import { helpers } from 'adex-models'

const { ipfsHashTo32BytesHex } = helpers
const GAS_LIMIT_ACCEPT_BID = 450000
const GAS_LIMIT_APPROVE_0_WHEN_NO_0 = 65136 + 1
const GAS_LIMIT_APPROVE_OVER_0_WHEN_0 = 65821 + 1

const checkBidIdAndSign = ({ exchange, _id, _advertiser, _adUnit, _opened, _target, _amount, _timeout, v, r, s, sig_mode }) => {
    return exchange.methods
        .didSign(_advertiser, _id, v, r, s, sig_mode)
        .call()
        .then((didSign) => {
            if (!didSign) {
                throw new Error('Invalid signature')
            } else {

                return exchange.methods.getBidID(_advertiser, _adUnit, _opened, _target, _amount, _timeout)
                    .call()
            }
        })
        .then((idCheck) => {
            console.log('idCheck', idCheck)
            console.log('_id', _id)
            if (idCheck !== _id) {
                throw new Error('idChecked err')
            } else {
                return true
            }
        })
}

export const acceptBid = ({ placedBid: { _id, _advertiser, _adUnit, _opened, _target, _amount, _timeout, _signature: { v, r, s, sig_mode } }, _adSlot, _addr, gas, onReceipt, user, estimateGasOnly } = {}) => {
    return getWeb3(user._authMode.authType)
        .then(({ web3, exchange, token }) => {
            /* TODO: Maybe we should keep _adUnit and _adSlot as it is on the contract (in 32 bytes hex)
            *   and decode it in the ui when needed
            * */
            _adUnit = ipfsHashTo32BytesHex(_adUnit)
            _adSlot = ipfsHashTo32BytesHex(_adSlot)
            _opened = _opened.toString() // TODO: validate - max 365 day in seconds (60 * 60 * 24 * 365)
            _target = _target.toString()
            _amount = _amount.toString()
            _timeout = _timeout.toString()
            v = '0x' + v.toString(16)
            sig_mode = (sig_mode).toString()

            let tx = exchange.methods.acceptBid(_advertiser, _adUnit, _opened, _target, _amount, _timeout, _adSlot, v, r, s, sig_mode)

            // TODO: Maybe we dont need to check didSign and getBidID
            return checkBidIdAndSign({ exchange, _id, _advertiser, _adUnit, _opened, _target, _amount, _timeout, v, r, s, sig_mode })
                .then(() => {
                    if (estimateGasOnly) {
                        return tx.estimateGas({ from: _addr })
                    } else {
                        return sendTx({
                            web3,
                            tx: tx,
                            opts: { from: _addr, gas },
                            user,
                            txSuccessData: { bidId: _id, state: EXCHANGE_CONSTANTS.BID_STATES.Accepted.id, trMethod: 'TRANS_MTD_EXCHANGE_ACCEPT_BID' }
                        })
                    }
                })
        })
}

// The bid is canceled by the advertiser
export const cancelBid = ({ placedBid: { _id, _advertiser, _adUnit, _opened, _target, _amount, _timeout, _signature: { v, r, s, sig_mode } }, _addr, gas, user, estimateGasOnly } = {}) => {
    return getWeb3(user._authMode.authType)
        .then(({ web3, exchange, token }) => {
            _adUnit = ipfsHashTo32BytesHex(_adUnit)
            _opened = _opened.toString() // TODO: validate - max 365 day in seconds (60 * 60 * 24 * 365)
            _target = _target.toString()
            _amount = _amount.toString()
            _timeout = _timeout.toString()
            v = '0x' + v.toString(16)
            sig_mode = (sig_mode).toString()

            let _advertiser = _addr

            // function cancelBid(bytes32 _adunit, uint _opened, uint _target, uint _amount, uint _timeout, uint8 v, bytes32 r, bytes32 s, uint8 sigMode)
            let tx = exchange.methods.cancelBid(_adUnit, _opened, _target, _amount, _timeout, v, r, s, sig_mode)

            // NOTE: if checkBidIdAndSign we can handle the error on tx preview and not let the user to try sign the tx  
            return checkBidIdAndSign({ exchange, _id, _advertiser, _adUnit, _opened, _target, _amount, _timeout, v, r, s, sig_mode })
                .then(() => {
                    if (estimateGasOnly) {
                        return tx.estimateGas({ from: _addr })
                    } else {
                        return sendTx({
                            web3,
                            tx: tx,
                            opts: { from: _addr, gas: gas },
                            user,
                            txSuccessData: { bidId: _id, state: EXCHANGE_CONSTANTS.BID_STATES.Canceled.id, trMethod: 'TRANS_MTD_EXCHANGE_CANCEL_BID' }
                        })
                    }
                })
        })
}

// TODO: get the report, make some endpoint on the node
export const verifyBid = ({ placedBid: { _id, _advertiser, _publisher }, _report, _addr, gas, side, user, estimateGasOnly } = {}) => {

    return getWeb3(user._authMode.authType)
        .then(({ web3, exchange, token }) => {

            _report = ipfsHashTo32BytesHex(_report)

            let tx = exchange.methods.verifyBid(_id, _report)

            let state = 'CONFIRM_BID'
            // TODO: constants for advertiser/publisher
            if (side === 'advertiser') {
                state = EXCHANGE_CONSTANTS.BID_STATES.ConfirmedAdv.id
            } else if (side === 'publisher') {
                state = EXCHANGE_CONSTANTS.BID_STATES.ConfirmedPub.id
            }

            if (estimateGasOnly) {
                return tx.estimateGas({ from: _addr })
            } else {
                return sendTx({
                    web3,
                    tx: tx,
                    opts: { from: _addr, gas: gas },
                    user,
                    txSuccessData: { bidId: _id, state: state, trMethod: 'TRANS_MTD_EXCHANGE_VERIFY_BID' }
                })
            }
        })
}

// The bid is canceled by the publisher
export const giveupBid = ({ placedBid: { _id, _advertiser, _publisher }, _addr, gas, user, estimateGasOnly } = {}) => {

    if (_publisher !== _addr) {
        return Promise.reject('Not your bid')
    }

    return getWeb3(user._authMode.authType)
        .then(({ web3, exchange, token }) => {

            let tx = exchange.methods.giveupBid(_id)

            if (estimateGasOnly) {
                return tx.estimateGas({ from: _addr })
            } else {
                return sendTx({
                    web3,
                    tx: tx,
                    opts: { from: _addr, gas: gas },
                    user,
                    txSuccessData: { bidId: _id, state: EXCHANGE_CONSTANTS.BID_STATES.Canceled.id, trMethod: 'TRANS_MTD_EXCHANGE_GIVEUP_BID' }
                })
            }
        })
}

// This can be done if a bid is accepted, but expired
export const refundBid = ({ placedBid: { _id, _advertiser, _publisher }, _addr, gas, user, estimateGasOnly } = {}) => {

    if (_advertiser !== _addr) {
        return Promise.reject('Not your bid')
    }

    return getWeb3(user._authMode.authType)
        .then(({ web3, exchange, token }) => {

            let tx = exchange.methods.refundBid(_id)

            if (estimateGasOnly) {
                return tx.estimateGas({ from: _addr })
            } else {
                return sendTx({
                    web3,
                    tx: tx,
                    opts: { from: _addr, gas: gas },
                    user,
                    txSuccessData: { bidId: _id, state: EXCHANGE_CONSTANTS.BID_STATES.Expired.id, trMethod: 'TRANS_MTD_EXCHANGE_REFUND_BID' }
                })
            }
        })
}

// gets the hash (bid id) from adex exchange contract
const getAdexExchangeBidHash = ({ exchange, typedData }) => {
    // getBidID(address _advertiser, bytes32 _adunit, uint _opened, uint _target, uint _amount, uint _timeout)
    return exchange.methods.getBidID(typedData[0].value, typedData[1].value, typedData[2].value, typedData[3].value, typedData[4].value, typedData[5].value)
        .call()
}

export const signBid = ({ userAddr, bid, user }) => {
    return getWeb3(user._authMode.authType)
        .then(({ cfg, web3, exchange }) => {
            //NOTE: We need to set the exchangeAddr because it is needed for the hash
            bid.exchangeAddr = cfg.addr.exchange //Need bid instance
            bid.amount = adxAmountStrToPrecision(bid.amount) // * 10 000 but safe
            bid.opened = Date.now()

            // NOTE: Currently instance of bid is passed - must be changed
            let typed = bid.typed

            let hashCheck = getTypedDataHash({ typedData: typed })
            let mode = user._authMode.sigMode

            console.log('user', user)

            return getAdexExchangeBidHash({ exchange: exchange, typedData: typed })
                .then((scHash) => {
                    if (scHash === hashCheck) {
                        return hashCheck
                    } else {
                        throw new Error('Error calculated hash does not match exchange id')
                    }
                })
                .then((checkedHash) => {
                    return signTypedMsg({ mode, userAddr, typedData: typed, addrIdx: user._settings.addrIdx, hdPath: user._settings.hdPath })
                })
                .then((res) => {
                    let signature = { sig_mode: mode, signature: res.sig, hash: res.hash, ...getRsvFromSig(res.sig) }
                    return signature
                })
        })
}

export const depositToExchangeEG = ({ amountToDeposit, _addr, user, gas }) => {
    let txResults = []

    return getWeb3(user._authMode.authType)
        .then(({ web3, exchange, token }) => {
            return token.methods
                .allowance(_addr, cfg.addr.exchange)
                .call()
                .then((allowance) => {
                    if (parseInt(allowance, 10) !== 0) {
                        txResults.push({ trMethod: 'TRANS_MTD_EXCHANGE_SET_ALLOWANCE_TO_ZERO', gas: GAS_LIMIT_APPROVE_0_WHEN_NO_0 })
                        txResults.push({ trMethod: 'TRANS_MTD_EXCHANGE_SET_ALLOWANCE', gas: GAS_LIMIT_APPROVE_OVER_0_WHEN_0 })
                    } else {
                        txResults.push({ trMethod: 'TRANS_MTD_EXCHANGE_SET_ALLOWANCE', gas: GAS_LIMIT_APPROVE_OVER_0_WHEN_0 })
                    }

                    txResults.push({ trMethod: 'TRANS_MTD_EXCHANGE_DEPOSIT', gas: 90000 })

                    return txResults
                })
        })

}

export const depositToExchange = ({ amountToDeposit, _addr, user, gas }) => {
    let amount = adxAmountStrToHex(amountToDeposit)
    let txResults = []

    return getWeb3(user._authMode.authType)
        .then(({ web3, exchange, token }) => {
            var p
            return token.methods
                .allowance(_addr, cfg.addr.exchange)
                .call()
                .then((allowance) => {
                    if (parseInt(allowance, 10) !== 0) {
                        p = sendTx({
                            web3,
                            tx: token.methods.approve(cfg.addr.exchange, adxAmountStrToHex('0')),
                            opts: { from: _addr, gas: GAS_LIMIT_APPROVE_0_WHEN_NO_0 },
                            user,
                            txSuccessData: { trMethod: 'TRANS_MTD_EXCHANGE_SET_ALLOWANCE_TO_ZERO' },
                        })
                            .then((result) => {
                                txResults.push(result)
                                return sendTx({
                                    web3,
                                    tx: token.methods.approve(cfg.addr.exchange, amount),
                                    opts: { from: _addr, gas: GAS_LIMIT_APPROVE_OVER_0_WHEN_0 },
                                    user,
                                    txSuccessData: { trMethod: 'TRANS_MTD_EXCHANGE_SET_ALLOWANCE' }
                                })
                            })

                    } else {
                        p = sendTx({
                            web3,
                            tx: token.methods.approve(cfg.addr.exchange, amount),
                            opts: { from: _addr, gas: GAS_LIMIT_APPROVE_OVER_0_WHEN_0 },
                            user,
                            txSuccessData: { trMethod: 'TRANS_MTD_EXCHANGE_SET_ALLOWANCE' }
                        })
                    }

                    return p.then((result) => {
                        txResults.push(result)
                        return sendTx({
                            web3,
                            tx: exchange.methods.deposit(amount),
                            opts: { from: _addr, gas: 90000 },
                            user,
                            txSuccessData: { trMethod: 'TRANS_MTD_EXCHANGE_DEPOSIT' }
                        })
                    })
                })
                .then((result) => {
                    txResults.push(result)
                    console.log('depositToExchange result ', txResults)
                    return txResults
                })
        })
}

export const withdrawFromExchange = ({ amountToWithdraw, _addr, gas, user, estimateGasOnly }) => {
    let amount = adxAmountStrToHex(amountToWithdraw)

    return getWeb3(user._authMode.authType)
        .then(({ web3, exchange, token, mode }) => {
            let tx = exchange.methods.withdraw(amount)

            if (estimateGasOnly) {
                return tx.estimateGas({ from: _addr })
            } else {
                // TODO: if no gas provided estimate the gas but we should always get the gas
                return sendTx({
                    web3,
                    tx: tx,
                    opts: { from: _addr, gas: gas || 90000 },
                    user,
                    txSuccessData: { trMethod: 'TRANS_MTD_EXCHANGE_WITHDRAW' }
                })
            }
        })
}