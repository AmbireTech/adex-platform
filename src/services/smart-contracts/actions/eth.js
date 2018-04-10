import { cfg, web3Utils, getWeb3 } from 'services/smart-contracts/ADX'
import { GAS_PRICE, MULT, DEFAULT_TIMEOUT } from 'services/smart-contracts/constants'
import { sendTx } from 'services/smart-contracts/actions/web3'
// import { encrypt } from 'services/crypto/crypto'
// import { registerItem } from 'services/smart-contracts/actions'
const GAS_LIMIT = 21000

export const withdrawEth = ({ _addr, withdrawTo, amountToWithdraw, gas, user, estimateGasOnly } = {}) => {

    let amount = web3Utils.toWei(amountToWithdraw, 'ether')

    return getWeb3(user._authMode.authType)
        .then(({ web3, exchange, token }) => {

            if (estimateGasOnly) {
                return web3.eth.estimateGas({ from: _addr, value: amount, to: withdrawTo })
            } else {
                // TODO: Fix it to work with sendTransaction
                return sendTx({
                    web3,
                    tx: web3.eth.sendTransaction,
                    opts: { from: _addr, gas: gas, value: amount, to: withdrawTo },
                    user,
                    txSuccessData: { trMethod: 'TRANS_MTD_ETH_WITHDRAW' }
                })
            }
        })
}

export const getCurrentGasPrice = () => {
    return new Promise((resolve, reject) => {
        getWeb3().then(({ cfg, exchange, token, web3 }) => {

            return resolve(web3.eth.getGasPrice())
        })
    })
}

const getExchangeBalances = (exchBal = {}) => {
    let adxOnExchangeTotal = ((exchBal[0] || 0))
    let adxOnBids = ((exchBal[1] || 0))
    let exchangeAvailable = adxOnExchangeTotal - adxOnBids + ''

    return {
        total: adxOnExchangeTotal,
        onBids: adxOnBids,
        available: exchangeAvailable
    }
}


export const getAccountBalances = (_addr) => {
    return getWeb3()
        .then(({ cfg, exchange, token, web3 }) => {
            return exchange.methods.getBalance(_addr).call()
        })
        .then((exchBal) => {
            return getExchangeBalances(exchBal)
        })
}

export const getAccountStats = ({ _addr, authType, mode }) => {
    return getWeb3(authType).then(({ cfg, exchange, token, web3 }) => {
        let balanceEth = web3.eth.getBalance(_addr)
        let balanceAdx = token.methods.balanceOf(_addr).call()
        let allowance = token.methods.allowance(_addr, cfg.addr.exchange).call()
        let exchangeBalance = exchange.methods.getBalance(_addr).call()

        let all = [balanceEth, balanceAdx, allowance, exchangeBalance]

        return Promise.all(all)
            .then(([balEth, balAdx, allow, exchBal]) => {

                let accStats = {
                    addr: _addr,
                    balanceEth: balEth,
                    balanceAdx: balAdx,
                    allowance: allow,
                    exchangeBalance: getExchangeBalances(exchBal)
                }

                return accStats
            })
    })
}

export const getAccountStatsMetaMask = () => {
    return new Promise((resolve, reject) => {
        getWeb3().then(({ cfg, exchange, token, web3 }) => {
            web3.eth.getAccounts((err, accounts) => {
                let _addr = accounts[0]

                if (!_addr) {
                    reject('No metamask addr!')
                }

                // TODO: check for possible race condition 
                let balanceEth = web3.eth.getBalance(_addr)
                let balanceAdx = token.methods.balanceOf(_addr).call()
                let allowance = token.methods.allowance(_addr, cfg.addr.exchange).call()
                let exchangeBalance = exchange.methods.getBalance(_addr).call()

                let all = [balanceEth, balanceAdx, allowance, exchangeBalance]

                Promise.all(all)
                    .then(([balEth, balAdx, allow, exchBal]) => {

                        let accStats =
                            {
                                balanceEth: balEth,
                                balanceAdx: balAdx,
                                allowance: allow,
                                exchangeBalance: getExchangeBalances(exchBal)
                            }

                        // console.log('accStats', accStats)
                        return resolve(accStats)
                    })
                    .catch((err) => {
                        console.log('getAccountStats err', err)
                        reject(err)
                    })
            })
        })
    })
}

export const getTransactionsReceipts = (trHashes = []) => {
    // TODO: Auth type
    return getWeb3()
        .then(({ cfg, exchange, token, web3 }) => {
            let all = trHashes.map((trH) => web3.eth.getTransactionReceipt(trH))
            return Promise.all(all)
        })
}

