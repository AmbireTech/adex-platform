/* NOTE: Localhost config - works wit EthereumJS TestRPC v4.1.3 (ganache-core: 1.1.3)
 * sudo npm install -g ethereumjs-testrpc@4.1.3
 * adex-core yarn test (just exchange) (created contracts 2-token, 3-registry, 4-exchange)
 * acc (0) - 100ETH, 100 000 000 ADX
*/
export const testrpcCfg = {
    node: '//127.0.0.1:8545/',
    addr: {
        token: '0x80353326c31ac6cbce11f100b27e97ead7ff4f40',
        registry: '0x2d7273ed5b65470d54af113544d74892ab9a9376',
        exchange: '0xfca39eb3125bf80c439629b82b2d0993dca5b16e',
    }
}

export const testAcc = {
    addr: '0x88bfdba21e7e96132943f30aba99ff85dd93d2ad',
    prKey: '30a7f77eba864f2404fe3363298b70e496b5d9b2b920430d67d65a8b1075ca54'
}

/** Test accounts

Available Accounts
==================
(0) 0x88bfdba21e7e96132943f30aba99ff85dd93d2ad
(1) 0xa2edcd10d2b7ae8b5bc68439a33ec295b78bc4c2
(2) 0xc21bcd65c0c7d3352942ab7b3d1dc1d129194ab2
(3) 0x32ab4896876b537c3d13e0d0979fd16016398db0
(4) 0x4bac8120cc52da9e78fb501114754d94e848641b
(5) 0xb5b155dec7eeec13bc48bf5227159e77fd9b4291
(6) 0x5768be028e7afada69383d9597fd9f3297477bd1
(7) 0x5fcffe0739b5c49fbba6315b5a0949e978dc182a
(8) 0x0ca99b323a10e52c98bd2040fb88578077319669
(9) 0x5b852f42072b84b25f90c5c29950def3cbdf8a79

Private Keys
==================
(0) 30a7f77eba864f2404fe3363298b70e496b5d9b2b920430d67d65a8b1075ca54
(1) 228ab7d6f8107a0fef56abdcfeb87b1286d7d841c94144cf3512b1e52e06bbef
(2) 90d4258a695cb49b32c0bd68a1f92f1afbd4a6f1cdabbd291289a4e714f24051
(3) 20547acd708a1b746b43c9b58fdbc55475e4d2cd333f7efe44b556d172b33498
(4) ec6e8ce507bf328399ab6691b18c6ada1540d21b47445e5c41eefe9af9593004
(5) df9c7c409c4739f23e7e691ee5db0df9b6e719bb13f6250115f8a6f27194e34f
(6) 6752443b077f6ac0cab512ac9dc4ed480b9925db5e49d42568a8d82267a61f47
(7) bb70641a8b1c1a5ef36d4201119b3a2f1ad3ad220b02cb113fed305133f7f4f1
(8) 8fdbe03e3a3f5b338d4b850bd4e66c9991baa22b70d49bc22fdec63dbf325a56
(9) 35b3a35a4c6028b4586295cb3028b9b78419cd9ca06b22a835415df576035cf7

HD Wallet
==================
Mnemonic:      skin shoulder soon hard permit pear style enough shell creek main quality
Base HD Path:  m/44'/60'/0'/0/{account_index}

 */