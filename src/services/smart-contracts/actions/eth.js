import { cfg, web3Utils, getWeb3 } from 'services/smart-contracts/ADX'
import { GAS_PRICE, MULT, DEFAULT_TIMEOUT } from 'services/smart-contracts/constants'
// import { encrypt } from 'services/crypto/crypto'
// import { registerItem } from 'services/smart-contracts/actions'
const GAS_LIMIT = 21000

export const withdrawEthEstimateGas = ({ _addr, withdrawTo, amountToWithdraw } = {}) => {

    let amount = web3Utils.toWei(amountToWithdraw, 'ether')

    return new Promise((resolve, reject) => {
        getWeb3.then(({ cfg, exchange, token, web3 }) => {
            web3.eth.estimateGas({
                from: _addr,
                to: withdrawTo,
                value: amount
            })
                .then(function (res) {
                    console.log('withdrawEthEstimateGas res', res)
                    return resolve(res)
                })
                .catch((err) => {
                    console.log('withdrawEthEstimateGas err', err)
                    reject(err)
                })
        })
    })
}

export const withdrawEth = ({ _addr, withdrawTo, amountToWithdraw, gas } = {}) => {

    let amount = web3Utils.toWei(amountToWithdraw, 'ether')

    return new Promise((resolve, reject) => {
        getWeb3.then(({ cfg, exchange, token, web3 }) => {
            web3.eth.sendTransaction({
                from: _addr,
                to: withdrawTo,
                value: amount,
                gas: gas || GAS_LIMIT
            })
            .on('transactionHash', (hash) => {
                resolve({trHash: hash, trMethod: 'TRANS_MTD_ETH_WITHDRAW'})
            })
            .on('error', (err) => {
                reject(err)
            })
        })
    })
}

export const getCurrentGasPrice = () => {
    return new Promise((resolve, reject) => {
        getWeb3.then(({ cfg, exchange, token, web3 }) => {

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

export const getAccountStats = ({ _addr }) => {
    return new Promise((resolve, reject) => {
        getWeb3.then(({ cfg, exchange, token, web3 }) => {
            let balanceEth = web3.eth.getBalance(_addr)
            let balanceAdx = token.methods.balanceOf(_addr).call()
            let allowance = token.methods.allowance(_addr, cfg.addr.exchange).call()
            let exchangeBalance = exchange.methods.getBalance(_addr).call()

            let all = [balanceEth, balanceAdx, allowance, exchangeBalance]

            Promise.all(all)
                .then(([balEth, balAdx, allow, exchBal]) => {

                    let accStats = {
                        balanceEth: balEth,
                        balanceAdx: balAdx,
                        allowance: allow,
                        exchangeBalance: getExchangeBalances(exchBal)
                    }

                    console.log('accStats', accStats)
                    return resolve(accStats)
                })
                .catch((err) => {
                    console.log('getAccountStats err', err)
                    reject(err)
                })
        })
    })
}

export const getAccountStatsMetaMask = () => {
    return new Promise((resolve, reject) => {
        getWeb3.then(({ cfg, exchange, token, web3 }) => {
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

                        console.log('accStats', accStats)
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
