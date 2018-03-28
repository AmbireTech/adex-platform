import { cfg, getWeb3, web3Utils } from 'services/smart-contracts/ADX'
import { sendTx } from 'services/smart-contracts/actions/web3'
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
    return new Promise((resolve, reject) => {
        exchange.methods
            .didSign(_advertiser, _id, v, r, s, sig_mode)
            .call()
            .then((didSign) => {
                if (!didSign) {
                    return reject('Invalid signature')
                }

                return exchange.methods.getBidID(_advertiser, _adUnit, _opened, _target, _amount, _timeout)
                    .call()
            })
            .then((idCheck) => {
                console.log('idCheck', idCheck)
                console.log('_id', _id)
                if (idCheck !== _id) {
                    return reject('idChecked err')
                } else {
                    return resolve(true)
                }
            })
    })
}

export const acceptBid = ({ placedBid: { _id, _advertiser, _adUnit, _opened, _target, _amount, _timeout, _signature: { v, r, s, sig_mode } }, _adSlot, _addr, gas, gasPrice, onReceipt } = {}) => {
    return new Promise((resolve, reject) => {

        getWeb3()
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

                let acceptBid = exchange.methods
                    .acceptBid(_advertiser, _adUnit, _opened, _target, _amount, _timeout, _adSlot, v, r, s, sig_mode)

                // TODO: Maybe we dont need to check didSign and getBidID
                checkBidIdAndSign({ exchange, _id, _advertiser, _adUnit, _opened, _target, _amount, _timeout, v, r, s, sig_mode })
                    .then(() => {
                        return acceptBid
                            .estimateGas({ from: _addr })
                    })
                    .then((estimatedGas) => {
                        // console.log('estimatedGas', estimatedGas)
                        return acceptBid
                            .send({ from: _addr, gas: estimatedGas })
                            .on('transactionHash', (hash) => {
                                console.log('acceptBid transactionHash', hash)
                                resolve({ bidId: _id, state: EXCHANGE_CONSTANTS.BID_STATES.Accepted.id, trHash: hash, trMethod: 'TRANS_MTD_EXCHANGE_ACCEPT_BID' })

                            })
                            .on('error', (err) => {
                                console.log('acceptBid err', err)
                                reject(err)
                            })
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })
    })
}

// The bid is canceled by the advertiser
export const cancelBid = ({ placedBid: { _id, _advertiser, _adUnit, _opened, _target, _amount, _timeout, _signature: { v, r, s, sig_mode } }, _addr, gas, gasPrice } = {}) => {
    return new Promise((resolve, reject) => {
        getWeb3()
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
                let cancelBid = exchange.methods
                    .cancelBid(_adUnit, _opened, _target, _amount, _timeout, v, r, s, sig_mode)


                checkBidIdAndSign({ exchange, _id, _advertiser, _adUnit, _opened, _target, _amount, _timeout, v, r, s, sig_mode })
                    .then(() => {
                        return cancelBid
                            .estimateGas({ from: _addr })
                    })
                    .then((estimatedGas) => {
                        // console.log('estimatedGas', estimatedGas)
                        return cancelBid
                            .send({ from: _addr, gas: estimatedGas })
                            .on('transactionHash', (hash) => {
                                console.log('cancelBid transactionHash', hash)
                                resolve({ bidId: _id, state: EXCHANGE_CONSTANTS.BID_STATES.Canceled.id, trHash: hash, trMethod: 'TRANS_MTD_EXCHANGE_CANCEL_BID' })
                            })
                            .on('error', (err) => {
                                console.log('cancelBid err', err)
                                reject(err)
                            })
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })
            .catch((err) => {
                reject(err)
            })
    })
}

// TODO: get the report, make some endpoint on the node
export const verifyBid = ({ placedBid: { _id, _advertiser, _publisher }, _report, _addr, gas, gasPrice, side } = {}) => {
    return new Promise((resolve, reject) => {
        getWeb3()
            .then(({ web3, exchange, token }) => {

                _report = ipfsHashTo32BytesHex(_report)

                let verifyBid = exchange.methods
                    .verifyBid(_id, _report)

                let state = 'CONFIRM_BID'
                // TODO: constants for advertiser/publisher
                if (side === 'advertiser') {
                    state = EXCHANGE_CONSTANTS.BID_STATES.ConfirmedAdv.id
                } else if (side === 'publisher') {
                    state = EXCHANGE_CONSTANTS.BID_STATES.ConfirmedPub.id
                }

                verifyBid
                    .estimateGas({ from: _addr })
                    .then((estimatedGas) => {
                        return verifyBid
                            .send({ from: _addr, gas: estimatedGas })
                            .on('transactionHash', (hash) => {
                                console.log('verifyBid transactionHash', hash)
                                resolve({ bidId: _id, state: state, trHash: hash, trMethod: 'TRANS_MTD_EXCHANGE_VERIFY_BID' })
                            })
                            .on('error', (err) => {
                                console.log('verifyBid err', err)
                                reject(err)
                            })
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })
            .catch((err) => {
                reject(err)
            })
    })
}

// The bid is canceled by the publisher
export const giveupBid = ({ placedBid: { _id, _advertiser, _publisher }, _addr, gas, gasPrice } = {}) => {
    return new Promise((resolve, reject) => {

        if (_publisher !== _addr) {
            return resolve('Not your bid')
        }

        getWeb3()
            .then(({ web3, exchange, token }) => {

                let giveupBid = exchange.methods
                    .giveupBid(_id)

                giveupBid
                    .estimateGas({ from: _addr })
                    .then((estimatedGas) => {
                        return giveupBid
                            .send({ from: _addr, gas: estimatedGas })
                            .on('transactionHash', (hash) => {
                                console.log('giveupBid transactionHash', hash)
                                resolve({ bidId: _id, state: EXCHANGE_CONSTANTS.BID_STATES.Canceled.id, trHash: hash, trMethod: 'TRANS_MTD_EXCHANGE_GIVEUP_BID' })
                            })
                            .on('confirmation', (confirmationNumber, receipt) => {
                                console.log('giveupBid confirmation confirmationNumber', confirmationNumber)
                                console.log('giveupBid confirmation receipt', receipt)
                            })
                            .on('receipt', (receipt) => {
                                console.log('giveupBid receipt', receipt)
                            })
                            .on('error', (err) => {
                                console.log('giveupBid err', err)
                                reject(err)
                            })
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })
    })
}

// This can be done if a bid is accepted, but expired
export const refundBid = ({ placedBid: { _id, _advertiser, _publisher }, _addr, gas, gasPrice } = {}) => {
    return new Promise((resolve, reject) => {

        if (_advertiser !== _addr) {
            return resolve('Not your bid')
        }

        getWeb3()
            .then(({ web3, exchange, token }) => {

                let refundBid = exchange.methods
                    .refundBid(_id)

                refundBid
                    .estimateGas({ from: _addr })
                    .then((estimatedGas) => {
                        return refundBid
                            .send({ from: _addr, gas: estimatedGas })
                            .on('transactionHash', (hash) => {
                                console.log('refundBid transactionHash', hash)
                                resolve({ bidId: _id, state: EXCHANGE_CONSTANTS.BID_STATES.Expired.id, trHash: hash, trMethod: 'TRANS_MTD_EXCHANGE_REFUND_BID' })
                            })
                            .on('error', (err) => {
                                console.log('refundBid err', err)
                                reject(err)
                            })
                    })
                    .catch((err) => {
                        reject(err)
                    })
            })
    })
}

// gets the hash (bid id) from adex exchange contract
const getAdexExchangeBidHash = ({ exchange, typedData }) => {
    return new Promise((resolve, reject) => {
        // getBidID(address _advertiser, bytes32 _adunit, uint _opened, uint _target, uint _amount, uint _timeout)
        exchange.methods.getBidID(typedData[0].value, typedData[1].value, typedData[2].value, typedData[3].value, typedData[4].value, typedData[5].value)
            .call()
            .then((scHash) => {
                return resolve(scHash)
            })
            .catch((err) => {
                return reject(err)
            })
    })
}

export const signBid = ({ userAddr, bid }) => {
    return new Promise((resolve, reject) => {
        getWeb3().then(({ cfg, web3, exchange, token, mode }) => {
            //NOTE: We need to set the exchangeAddr because it is needed for the hash
            bid.exchangeAddr = cfg.addr.exchange //Need bid instance
            bid.amount = adxAmountStrToPrecision(bid.amount) // * 10 000 but safe
            bid.opened = Date.now()

            let typed = bid.typed

            let hash = getTypedDataHash({ typedData: typed })

            getAdexExchangeBidHash({ exchange: exchange, typedData: typed })
                .then((scHash) => {
                    if (scHash === hash) {
                        return hash
                    } else {
                        throw new Error('Error calculated hash does not match exchange id  ')
                    }
                })
                .then((checkedHash) => {
                    if (mode === EXCHANGE_CONSTANTS.SIGN_TYPES.Eip.id) {
                        web3.currentProvider.sendAsync({
                            method: 'eth_signTypedData',
                            params: [typed, userAddr],
                            from: userAddr
                        }, (err, res) => {
                            if (err) {
                                return reject(err)
                            }

                            if (res.error) {
                                return reject(res.error)
                            }

                            //TODO: do it with the Bid model
                            let signature = { sig_mode: mode, signature: res.result, hash: checkedHash, ...getRsvFromSig(res.result) }
                            return resolve(signature)
                        })
                    }
                })
                .catch((err) => {
                    return reject(err)
                })
        })
    })
}

function approveTokens({ token, _addr, exchangeAddr, amount, gas }) {
    // return new Promise((resolve, reject) => {
    return token.methods.approve(cfg.addr.exchange, amount)
    // .send({ from: _addr, gas: gas })
    // .on('transactionHash', (hash) => {
    //     resolve()
    // })
    // .on('error', (err) => {
    //     reject(err)
    // })
    // })
}

function sendDeposit({ exchange, _addr, amount, gas }) {
    // return new Promise((resolve, reject) => {
    return exchange.methods.deposit(amount)
    //             .send({ from: _addr, gas: gas })
    //             .on('transactionHash', (hash) => {
    //                 resolve({trHash: hash, trMethod: 'TRANS_MTD_EXCHANGE_DEPOSIT'})
    //             })
    //             .on('error', (err) => {
    //                 reject(err)
    //             })
    //     })
}

// export const depositToExchange = ({ amountToDeposit, _addr, user, gas }) => {
//     let amount = adxAmountStrToHex(amountToDeposit)
//     let mode = user._authMode.signType

//     return new Promise((resolve, reject) => {
//         getWeb3(user._authMode.authType).then(({ web3, exchange, token }) => {
//             var p
//             token.methods
//                 .allowance(_addr, cfg.addr.exchange)
//                 .call()
//                 .then((allowance) => {
//                     if (parseInt(allowance, 10) !== 0) {
//                         p = approveTokens({ token: token, _addr: _addr, exchangeAddr: cfg.addr.exchange, amount: adxAmountStrToHex('0'), gas: GAS_LIMIT_APPROVE_0_WHEN_NO_0 })
//                             .then(() => {
//                                 approveTokens({ token: token, _addr: _addr, exchangeAddr: cfg.addr.exchange, amount: amount, gas: GAS_LIMIT_APPROVE_OVER_0_WHEN_0 })
//                             })

//                     } else {
//                         p = approveTokens({ token: token, _addr: _addr, exchangeAddr: cfg.addr.exchange, amount: amount, gas: GAS_LIMIT_APPROVE_OVER_0_WHEN_0 })
//                     }

//                     return p.then(() => {
//                         return sendDeposit({ exchange: exchange, _addr: _addr, amount: amount, gas: 90000 })
//                     })
//                 })
//                 .then((result) => {
//                     console.log('depositToExchange result ', result)
//                     return resolve(result)
//                 })
//                 .catch((err) => {
//                     console.log('token approve err', err)
//                     reject(err)
//                 })
//         })
//     })
// }

export const depositToExchange = ({ amountToDeposit, _addr, user, gas }) => {
    let amount = adxAmountStrToHex(amountToDeposit)
    let mode = user._authMode.signType

    return new Promise((resolve, reject) => {
        getWeb3(user._authMode.authType).then(({ web3, exchange, token }) => {
            var p
            token.methods
                .allowance(_addr, cfg.addr.exchange)
                .call()
                .then((allowance) => {
                    if (parseInt(allowance, 10) !== 0) {
                        p = sendTx({
                            tx: approveTokens({ token: token, _addr: _addr, exchangeAddr: cfg.addr.exchange, amount: adxAmountStrToHex('0'), gas: GAS_LIMIT_APPROVE_0_WHEN_NO_0 }),
                            opts: { gas: GAS_LIMIT_APPROVE_0_WHEN_NO_0 },
                            user,
                            txSuccessData: { trMethod: 'TRANS_MTD_EXCHANGE_SET_ALLOWANCE_TO_ZERO' }
                        })
                            .then(() => {
                                sendTx({
                                    tx: approveTokens({ token: token, _addr: _addr, exchangeAddr: cfg.addr.exchange, amount: amount, gas: GAS_LIMIT_APPROVE_OVER_0_WHEN_0 }),
                                    opts: { gas: GAS_LIMIT_APPROVE_OVER_0_WHEN_0 },
                                    user,
                                    txSuccessData: { trMethod: 'TRANS_MTD_EXCHANGE_SET_ALLOWANCE' }
                                })
                            })

                    } else {
                        p = sendTx({
                            tx: approveTokens({ token: token, _addr: _addr, exchangeAddr: cfg.addr.exchange, amount: amount, gas: GAS_LIMIT_APPROVE_OVER_0_WHEN_0 }),
                            opts: { gas: GAS_LIMIT_APPROVE_OVER_0_WHEN_0 },
                            user,
                            txSuccessData: { trMethod: 'TRANS_MTD_EXCHANGE_SET_ALLOWANCE' }
                        })
                    }

                    return p.then(() => {
                        return sendTx({
                            tx: sendDeposit({ exchange: exchange, _addr: _addr, amount: amount, gas: 90000 }),
                            opts: { gas: 90000 },
                            user,
                            txSuccessData: { trMethod: 'TRANS_MTD_EXCHANGE_DEPOSIT' }
                        })
                    })
                })
                .then((result) => {
                    console.log('depositToExchange result ', result)
                    return resolve(result)
                })
                .catch((err) => {
                    console.log('token approve err', err)
                    reject(err)
                })
        })
    })
}

export const withdrawFromExchange = ({ amountToWithdraw, _addr, gas }) => {
    let amount = adxAmountStrToHex(amountToWithdraw)

    return new Promise((resolve, reject) => {
        getWeb3()
            .then(({ web3, exchange, token, mode }) => {
                exchange.methods.withdraw(amount)
                    .send({ from: _addr, gas: 90000 })
                    .on('transactionHash', (hash) => {
                        resolve({ trHash: hash, trMethod: 'TRANS_MTD_EXCHANGE_WITHDRAW' })
                    })
                    .on('error', (err) => {
                        reject(err)
                    })
            })
    })
}