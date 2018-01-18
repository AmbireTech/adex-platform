/* NOTE: Localhost config - works wit EthereumJS TestRPC v4.1.3 (ganache-core: 1.1.3)
 * sudo npm install -g ethereumjs-testrpc@4.1.3
 * adex-core yarn test (just exchange) (created contracts 2-token, 3-registry, 4-exchange)
 * acc (0) - 100ETH, 100 000 000 ADX
*/
export const testrpcCfg = {
    node: '//127.0.0.1:8545/',
    addr: {
        token: '0x9403dd7588f2df41c40c0ac4de775fa11b31f1e1',
        registry: '0x4e5b096f082cb5ddf6231cf0fd0f3c30e7847de6',
        exchange: '0x38c3ddc65ae7cb4e7b634437b4420d1410b98ae4',
    }
}

export const testAcc = {
    addr: '0x57bf74083201a3a10737a64f3591879b03b2c2ab',
    prKey: 'b0cae8a8ee84b270429ebedafdc0e16dd97065a87d122621450b1019dd23f632'
}

/** Test accounts

Available Accounts
==================
(0) 0x57bf74083201a3a10737a64f3591879b03b2c2ab
(1) 0x3944eab984429e9388c6c5da4f9b0397d67453d6
(2) 0x680dce1758ccafc5ec9a57261ac2c4c5ce45a86e
(3) 0x2483c44325e2bd29e32e8569f83ee9d6b7398725
(4) 0xabdeaf89ad1f4875ecea6a70a380e52cb0782a5c
(5) 0xb7dff2470a3263b90e4cf3c2abbfd9c986bb57cd
(6) 0xfe6c1e66f183572f7fb868a9f9227f6a428ef3e8
(7) 0xa216ca41854c5351ff910a7a928a103c3146424d
(8) 0x239ec0c147497a207bb4f16802648ae7377afdab
(9) 0x08f674be09610ba095fa5606e57cf347ad462c36

Private Keys
==================
(0) b0cae8a8ee84b270429ebedafdc0e16dd97065a87d122621450b1019dd23f632
(1) e4499d7f202be5bce4ae4999b16835344a197054765fea6137869b0d08455ed5
(2) 5335116abbae75680b5d1784720a5457a21f241e0b46b39c3c60bb7dd1091b59
(3) b69c9aed94d5db28c6867e9f4e69d90928409814fe7f3e8cb824f9f233acb218
(4) 1bd9ed058ef9e918554ab6bfe62c09372355c3a99570dd6ff94509d264594452
(5) 67254968a2b2b10f5e055855424c47a83737547c372d0951e3dd2329b2f74b69
(6) 91ab7c0e4998984999200b524d3a6cd11120328e49d3d64f0008e0b8d9e8796b
(7) d98fe025c7935030fee294c341ea905edabf9e92de5747cea117eb55c0376053
(8) 86ea27898316636c964647083cf256f041c59e46b199e9aad55f836cedbb8f3c
(9) 1caac8d651a15a95b6c70884055b91afa79627394fe00d05ee04dc3164bd6c8f

HD Wallet
==================
Mnemonic:      vicious stomach cluster book identify quiz deer fiber test depend warrior depart
Base HD Path:  m/44'/60'/0'/0/{account_index}

 */