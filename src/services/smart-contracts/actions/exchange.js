import { cfg, getWeb3, web3Utils } from 'services/smart-contracts/ADX'
import { GAS_PRICE, MULT, DEFAULT_TIMEOUT } from 'services/smart-contracts/constants'
import { toHexParam, ipfsHashToHex } from 'services/smart-contracts/utils'
import { encrypt } from 'services/crypto/crypto'
import { exchange as EXCHANGE_CONSTANTS } from 'adex-constants'

const GAS_LIMIT_ACCEPT_BID = 450000
const GAS_LIMIT_APPROVE_0_WHEN_NO_0 = 65136 + 1
const GAS_LIMIT_APPROVE_OVER_0_WHEN_0 = 65821 + 1

const toBN = web3Utils.toBN

const getHexAdx = (amountStr, noMultiply) => {
    let am = toBN(amountStr)
    if (!noMultiply) {
        am = am.mul(toBN(MULT))
    }
    let amHex = web3Utils.toHex(am)
    return amHex
}

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

export const acceptBid = ({ placedBid: { _id, _advertiser, _adUnit, _opened, _target, _amount, _timeout, _signature: { v, r, s, sig_mode } }, _adSlot, _addr, gas, gasPrice } = {}) => {
    return new Promise((resolve, reject) => {

        getWeb3
            .then(({ web3, exchange, token }) => {
                /* TODO: Maybe we should keep _adUnit and _adSlot as it is on the contract (in 32 bytes hex)
                *   and decode it in the ui when needed
                * */
                _adUnit = ipfsHashToHex(_adUnit)
                _adSlot = ipfsHashToHex(_adSlot)
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
                                resolve({ bidId: _id, state: EXCHANGE_CONSTANTS.BID_STATES.Accepted.id, trHash: hash })

                            })
                            .on('confirmation', (confirmationNumber, receipt) => {
                                console.log('acceptBid confirmation confirmationNumber', confirmationNumber)
                                console.log('acceptBid confirmation receipt', receipt)

                                if (receipt.status === '0x1') {
                                    resolve(receipt)
                                } else {
                                    reject(receipt)
                                }
                            })
                            .on('receipt', (receipt) => {
                                console.log('acceptBid receipt', receipt)
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
        getWeb3
            .then(({ web3, exchange, token }) => {
                _adUnit = ipfsHashToHex(_adUnit)
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
                                resolve({ bidId: _id, state: EXCHANGE_CONSTANTS.BID_STATES.Canceled.id, trHash: hash })
                            })
                            .on('confirmation', (confirmationNumber, receipt) => {
                                console.log('cancelBid confirmation confirmationNumber', confirmationNumber)
                                console.log('cancelBid confirmation receipt', receipt)

                                if (receipt.status === '0x1') {
                                    resolve(receipt)
                                } else {
                                    reject(receipt)
                                }
                            })
                            .on('receipt', (receipt) => {
                                console.log('cancelBid receipt', receipt)
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
export const verifyBid = ({ placedBid: { _id, _advertiser, publisher }, _report, _addr, gas, gasPrice } = {}) => {
    return new Promise((resolve, reject) => {
        getWeb3
            .then(({ web3, exchange, token }) => {

                _report = toHexParam(_report)

                let verifyBid = exchange.methods
                    .verifyBid(_id, _report)

                verifyBid
                    .estimateGas({ from: _addr })
                    .then((estimatedGas) => {
                        return verifyBid
                            .send({ from: _addr, gas: estimatedGas })
                            .on('transactionHash', (hash) => {
                                console.log('verifyBid transactionHash', hash)
                                resolve(hash)
                                // TODO: Send just the report if only one verification
                                // resolve({ bidId: _id, state: EXCHANGE_CONSTANTS.BID_STATES.Completed.id, trHash: hash })
                            })
                            .on('confirmation', (confirmationNumber, receipt) => {
                                console.log('verifyBid confirmation confirmationNumber', confirmationNumber)
                                console.log('verifyBid confirmation receipt', receipt)

                                if (receipt.status === '0x1') {
                                    resolve(receipt)
                                } else {
                                    reject(receipt)
                                }
                            })
                            .on('receipt', (receipt) => {
                                console.log('verifyBid receipt', receipt)
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
    })
}

const getRsvFromSig = (sig) => {
    sig = sig.slice(2)

    var r = '0x' + sig.substring(0, 64)
    var s = '0x' + sig.substring(64, 128)
    var v = parseInt(sig.substring(128, 130), 16)

    return { r: r, s: s, v: v }
}
// NOTE: works with typed data in format {type: 'solidity data type', name: 'string (label)', value: 'preferable string'} 
const getTypedDataHash = ({ typedData }) => {
    let values = typedData.map((entry) => {
        return entry.value // ? .toString().toLowerCase()
    })
    let valuesHash = web3Utils.soliditySha3.apply(null, values)

    let schema = typedData.map((entry) => { return entry.type + ' ' + entry.name })
    let schemaHash = web3Utils.soliditySha3.apply(null, schema)

    let hash = web3Utils.soliditySha3(schemaHash, valuesHash)

    return hash
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
        getWeb3.then(({ cfg, web3, exchange, token, mode }) => {
            //NOTE: We need to set the exchangeAddr because it is needed for the hash
            bid.exchangeAddr = cfg.addr.exchange //Need bid instance

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
                                throw new Error(err)
                            }

                            if (res.error) {
                                throw new Error(res.error)
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
    return new Promise((resolve, reject) => {
        token.methods.approve(cfg.addr.exchange, amount)
            .send({ from: _addr, gas: gas })
            .on('transactionHash', (hash) => {
                resolve()
            })
            .on('error', (err) => {
                reject(err)
            })
    })
}

function sendDeposit({ exchange, _addr, amount, gas }) {
    return new Promise((resolve, reject) => {
        exchange.methods.deposit(amount)
            .send({ from: _addr, gas: gas })
            .on('transactionHash', (hash) => {
                resolve()
            })
            .on('error', (err) => {
                reject(err)
            })
    })
}

export const depositToExchange = ({ amountToDeposit, _addr, gas }) => {
    let amount = getHexAdx(amountToDeposit)

    return new Promise((resolve, reject) => {
        getWeb3.then(({ web3, exchange, token, mode }) => {
            var p
            token.methods
                .allowance(_addr, cfg.addr.exchange)
                .call()
                .then((allowance) => {
                    if (parseInt(allowance, 10) !== 0) {
                        p = approveTokens({ token: token, _addr: _addr, exchangeAddr: cfg.addr.exchange, amount: getHexAdx(0), gas: GAS_LIMIT_APPROVE_0_WHEN_NO_0 })
                            .then(() => {
                                approveTokens({ token: token, _addr: _addr, exchangeAddr: cfg.addr.exchange, amount: amount, gas: GAS_LIMIT_APPROVE_OVER_0_WHEN_0 })
                            })

                    } else {
                        p = approveTokens({ token: token, _addr: _addr, exchangeAddr: cfg.addr.exchange, amount: amount, gas: GAS_LIMIT_APPROVE_OVER_0_WHEN_0 })
                    }

                    return p.then(() => {
                        return sendDeposit({ exchange: exchange, _addr: _addr, amount: amount, gas: 90000 })
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