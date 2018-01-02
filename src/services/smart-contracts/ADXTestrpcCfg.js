/* NOTE: Localhost config - works wit EthereumJS TestRPC v4.1.3 (ganache-core: 1.1.3)
 * sudo npm install -g ethereumjs-testrpc@4.1.3
 * adex-core yarn test (just exchange) (created contracts 2-token, 3-registry, 4-exchange)
 * acc (0) - 100ETH, 100 000 000 ADX
*/
export const testrpcCfg = {
    node: '//127.0.0.1:8545/',
    addr: {
        token: '0x821da9f8a2d841079a35a929b3cdd86e53a0b691',
        registry: '0xb46b011c8faa9e42ac1c3bdc12adc8306b12ad54',
        exchange: '0x2cef45ec06321de8c66423f345f0968d0768b603',
    }
}

export const testAcc = {
    addr: '0x6c120841550b64bddd8d6e04029569caf561d1c3',
    prKey: 'ab549407b2ecfddbab8dc843332a9b296937a56fd86ada5ec7f02afb15ca0f29'
}

/** Test accounts

Available Accounts
==================
(0) 0x6c120841550b64bddd8d6e04029569caf561d1c3
(1) 0xafa2a54b6d93a771ae321be5b47c85140db8a65a
(2) 0x0a9a8ef05ea5efa6685c14a443e75bc6e642b47e
(3) 0x95540ec0e80bbbd7c0435922e96d0e1082492986
(4) 0xef4074904c12b1a87fe48f6ca12cc40018c0e229
(5) 0x198d8a140aea1190fe209f548e0ef10ae1569525
(6) 0xb5c6fd51e731a4363c4b072782a84042de272904
(7) 0x412210cad9643eacb5e287d2e4d041ec8682d06c
(8) 0x91e50ba1af9903cc955e4d6d6c3d959c04843c83
(9) 0xcac9860ef5fe0b8747403ee5ef0242c1ec30a078

Private Keys
==================
(0) ab549407b2ecfddbab8dc843332a9b296937a56fd86ada5ec7f02afb15ca0f29
(1) aea2f2a98d632578f598fee5a19690224c81baf7b762e3f5b3ea8f53ba8c1582
(2) b50dfd8236cd675cea882b3c66caef5da8f78b44cc11b629a56da9747fc76e78
(3) 7914eebea68fcba88ae8f0acabd11266b9409323e4a3dddd6ec87709d400800b
(4) 110d892bbb2b78fcc2ddb7d3cb1f32f0805ac50a9f6ac04e092ad4eafd50e0f8
(5) a72d0f6e73c8ce6d42a16a0b26702bcfe8de897b3ac5e41c74082e1664d9160f
(6) 0d442d1f944b878827c2508f2cc9e95d4e819e52bc49cb2af927e6e4369a8009
(7) d7fb769ab8b6100a75252506d5d15556ef21a83912c686432cede3adb8cab6e6
(8) 8cdfc1f07b45c80ce3843e37eaa2ba6b44327274d7564579f618f903c8166267
(9) 434e730dd08afb1cba8d83adf2fbeb6fb028689c31be5da54602b2f75479bd29

HD Wallet
==================
Mnemonic:      sheriff fame bulk execute vicious census couch toy credit space believe security
Base HD Path:  m/44'/60'/0'/0/{account_index}

 */