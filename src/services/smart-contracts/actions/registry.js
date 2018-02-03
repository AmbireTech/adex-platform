// import {  web3, token, cfg } from 'services/smart-contracts/ADX'

// export const getAccountStats = ({ _addr }) => {
//     return new Promise((resolve, reject) => {
//         let balanceEth = web3.eth.getBalance(_addr)
//         let balanceAdx = token.methods.balanceOf(_addr).call()
//         let allowance = token.methods.allowance(_addr, cfg.addr.exchange).call()

//         let all = [balanceEth, balanceAdx, allowance]

//         Promise.all(all)
//             .then(([balEth, balAdx, allow, ]) => {

//                 let accStats =
//                     {
//                         balanceEth: balEth,
//                         balanceAdx: balAdx,
//                         allowance: allow
//                     }

//                 console.log('accStats', accStats)
//                 return resolve(accStats)
//             })
//             .catch((err) => {
//                 console.log('getAccountStats err', err)
//                 reject(err)
//             })
//     })
// }
