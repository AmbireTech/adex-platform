/* NOTE: Localhost config - works wit EthereumJS TestRPC v4.1.3 (ganache-core: 1.1.3)
 * sudo npm install -g ethereumjs-testrpc@4.1.3
 * adex-core yarn test (just exchange) (created contracts 2-token, 3-registry, 4-exchange)
 * acc (0) - 100ETH, 100 000 000 ADX
*/
export const testrpcCfg = {
    node: '//127.0.0.1:8545/',
    addr: {
        token: '0xc97c682b976c9d0e58871a1a16e8e908697ea1cd',
        registry: '0xad82a9b092f30605ead7331ac42dc3fead9dd6de',
        exchange: '0x8d41edf0a5728add1572ef0ec219b169ce7b124c',
    }
}

export const testAcc = {
    addr: '0xa9c2ad5dac07bdbb7308507a7e43b25b8ae5d1e3',
    prKey: 'c6ec1cf67a938362fa726f7526f2f5eeed5284948d03be71153a7a0042d5a2c3'
}

/** Test accounts

Available Accounts
==================
(0) 0xa9c2ad5dac07bdbb7308507a7e43b25b8ae5d1e3
(1) 0x047403ed93a3c0b107114552717c37a40963e603
(2) 0xc05247949c1ce46450c430f3a89e6d41f12e9a42
(3) 0xb92a4ad88e9df98d92577b7cd25c70f55a6d16cf
(4) 0xe537e1c1de1a690a73c8f79e28b198c23bbf03ab
(5) 0x59933b1c41bb423f307aa0439ee22eaf3d0d73c4
(6) 0x9b18d5e03c0a84053beef943aafe7412eed46210
(7) 0x2cb7b4e86f176f924d02231629cb57bf44b1d708
(8) 0xa6bd3d4c4442c7e26565ef94801cec494127a2a5
(9) 0x66d22235f1701c684026406f9fbdd36c63a85aae

Private Keys
==================
(0) c6ec1cf67a938362fa726f7526f2f5eeed5284948d03be71153a7a0042d5a2c3
(1) 638f35f6490a3224662b1a55baf6e3d3547c3dd81ae8acca24ab51dcbeeff372
(2) ff4ae57f2b8087f3a5d466f2b7a5e830f40ff6aecb0523f40d38d4f03c068fdf
(3) a840bdc449f26e810da4f2c15d84e2bc99e7fdb8b9d2bd6e9fe51f02a1ea9721
(4) 43bb32b723c66febcabddd906e396e4044bfdb449f2f3a780bfdbefdd8367a96
(5) 3dad59b69f9e629ff4ba2f14e95aa187c3febbec0861afac1becd238afa0c3b3
(6) deaa1f2c2f00ddc8c915534e7c7506244b42588f7b6d2f5127a991699819070a
(7) 93e2fdaace5e3818e1c29e391607034bd7f93934820c3e1cc1d11e5ed91f34d3
(8) 4b02f08f026d597dc401505b334633bc9988b93ecadeaaecb8f17f5046064155
(9) 9f88c5e76a8a9c048504a8e409078325e802c53066d499e494c2d096beff729b

HD Wallet
==================
Mnemonic:      come apology satoshi great immense choose circle supreme walnut skate exact sleep
Base HD Path:  m/44'/60'/0'/0/{account_index}

 */