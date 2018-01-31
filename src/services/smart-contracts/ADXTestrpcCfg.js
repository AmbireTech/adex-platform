/* NOTE: Localhost config - works wit EthereumJS TestRPC v4.1.3 (ganache-core: 1.1.3)
 * sudo npm install -g ethereumjs-testrpc@4.1.3
 * adex-core yarn test (just exchange) (created contracts 2-token, 3-registry, 4-exchange)
 * acc (0) - 100ETH, 100 000 000 ADX
*/
export const testrpcCfg = {
    node: '//127.0.0.1:8545/',
    addr: {
        token: '0x0959001b45fed03eabace56a96629ad5dcc50cfb',
        exchange: '0xad7fbed8fc43a4cd2183ec11a515c8ed1e2d5026',
    }
}

export const testAcc = {
    addr: '0x68a02703c3509785a04a3b76abce8e6ea95abfef',
    prKey: 'bb68bd7c666057a669a51f96f5a3394fc06d8164a3c740a0053e5904fabb4a96'
}

/** Test accounts

Available Accounts
==================
(0) 0x68a02703c3509785a04a3b76abce8e6ea95abfef
(1) 0xb9099ec018ec41da1e82dabfadd14b954becf278
(2) 0xc241df4e77d6107593d10de86712ae45711da69e
(3) 0x2d8dce01c28fd4439ff59dce39a7a59a88351aed
(4) 0xfad6cd63c2a073a388d2b179c4ab417619907766
(5) 0x12f315e2d05b33f29b3fe3a10328552ee4c2f8e5
(6) 0x28fe0fae12b12e654baa0255dfd7117b0c0d7846
(7) 0x278866b1063c00019a75c834e67cb240a9e6485c
(8) 0x8baeffa11b6aa8f710316cd9a11d59a95ba1c12e
(9) 0xaf3b3c4a5e6da340aa3a07c59b921df9a26b1540

Private Keys
==================
(0) bb68bd7c666057a669a51f96f5a3394fc06d8164a3c740a0053e5904fabb4a96
(1) 54172a19881fffa3ca7e54ae04ea37970bc75b8010e0dfe891084347521364b0
(2) ab861959b6fd7a0049c4d0e4ef27f26bf8669c10df546b6129fcb500f0bc517e
(3) 9a39d02750fe8e289afea7986ba0c94df85f7673c54f0e1409836d3932db0483
(4) 5906bb29d37d245d49ba13e76ba8d51ae3196ab100872d1126eac4a9ef3842e4
(5) 5f12a7f819d849f1a290851091d65b09c87863279643c1758501becc4c2f8088
(6) e44946fbe8b09172eb13567c624a46902d2c65b0cc47d892b9dd0fa4bfb0c754
(7) 7387842157a66d690a30cd47f2426a9ac94c846a6cc41a6bd75e4b89901ffa10
(8) 45130c19ad80237ac7b6ca858a3e3b3416f78df72127cbea0395217f154e2c1e
(9) 57cbc605b9aa332b15408271eaecf0f6bf57d98484e2e52181932a925cd4e39d

HD Wallet
==================
Mnemonic:      confirm camera bargain motion coconut demand strategy double exotic light satoshi trigger
Base HD Path:  m/44'/60'/0'/0/{account_index}

 */