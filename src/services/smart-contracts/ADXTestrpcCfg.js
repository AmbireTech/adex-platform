/* NOTE: Localhost config - works wit EthereumJS TestRPC v4.1.3 (ganache-core: 1.1.3)
 * sudo npm install -g ethereumjs-testrpc@4.1.3
 * adex-core yarn test (just exchange) (created contracts 2-token, 3-registry, 4-exchange)
 * acc (0) - 100ETH, 100 000 000 ADX
*/
export const testrpcCfg = {
    node: '//127.0.0.1:8545/',
    addr: {
        token: '0x1cf39f092a9d48be1a05ba4455da61b71224597f',
        registry: '0x76f21cb1636a00cd627433758f115f1b37cd2ff1',
        exchange: '0x1dfb3ab739e3e207e2c5ea9357b1a1719b47c7cf',
    }
}

export const testAcc = {
    addr: '0x863d64969f8a3cba9ce3e1dbcadb07e0a2ad7ff3',
    prKey: '406b6d40c78720abbce08c22ff24e575d59deeea8ab9b0f1a9b5aab8c21a3d4b'
}

/** Test accounts


Available Accounts
==================
(0) 0x863d64969f8a3cba9ce3e1dbcadb07e0a2ad7ff3
(1) 0xc0cd3914a378664d36252f53f6ce772eaee5ad78
(2) 0x4e79d966a3247514dcabbde4453a4e1d356bb517
(3) 0x124a8e446f7ec59c4cd253c0d9c44487b42ed601
(4) 0x961bfc8003f39e55c8804dbfe95bf6e39bc093a3
(5) 0x3b2982487e942f4ca022d88ffb77f4fa99b537a8
(6) 0x8718a1dbb596bfb96aebf27a5fe6dbb7dad67418
(7) 0xe84ca30cc69a9dc0c6be70b6968bd52098324dfe
(8) 0xb414faccfd77a3d6113bedb946b10811951bc39e
(9) 0xb3ed1e0f0d03d0cb80f5bbb7ec509e948bda30e3

Private Keys
==================
(0) 406b6d40c78720abbce08c22ff24e575d59deeea8ab9b0f1a9b5aab8c21a3d4b
(1) b0fadef873d2d4f98f837284190b74b5b393b01f558142d8a74d34266020edb2
(2) a42ec8c7f1a5d1cee4f6060c79615abf58f9c6967c1a797b5520c5ca2bfa0ab1
(3) c0422f1c001a5f5b5d3f3cb6d237cbc0978f0f2e0f682849d210d0ec055629f9
(4) 98706858996f1cd275251cf19d28f3b50ea2631c3d659539040d5497a62a5b22
(5) a63a69ba291f3a04299d96958b1d302c8fe2f01dbc7519e5b1a4ee6a68d0a672
(6) 9e9965d63c63a0e02a4631cbbcc8efff51aff98173b3b325041a16190316c534
(7) bb794e61c557d82bd28f870331c9fa99b4f46a7c195bc0f0874e41a16aad55b0
(8) f26a591cc46eb63d608bcd36acc88349aaa40252a78cd8a6fc526ad7be8b7804
(9) 380cbaaa26f932cc819ae3933f119c5f8edd3f6f1c49737488f73d1ab22e33b3

HD Wallet
==================
Mnemonic:      flush dumb flash liar velvet photo potato test afraid photo vocal canoe
Base HD Path:  m/44'/60'/0'/0/{account_index}

 */