/* NOTE: Localhost config - works wit EthereumJS TestRPC v4.1.3 (ganache-core: 1.1.3)
 * sudo npm install -g ethereumjs-testrpc@4.1.3
 * adex-core yarn test (just exchange) (created contracts 2-token, 3-registry, 4-exchange)
 * acc (0) - 100ETH, 100 000 000 ADX
*/
export const testrpcCfg = {
    node: '//127.0.0.1:8545/',
    addr: {
        token: '0x7c6bffdba035bf95700fa4a3b04e50012eab4b6f',
        registry: '0x7505288c38ccdf0ce29e9f69033b68da39834fe7',
        exchange: '0x8aad4ca7ebfbc4d7a87a3fa94d1bf3ee7be6e0b7',
    }
}

export const testAcc = {
    addr: '0x8904f34e7e16857e3d909ead31af3ec746daf939',
    prKey: 'ed41b9ec00fbaf9b3fe57b94cba4f7a3bcbb632f11fcd9993700bd749e879830'
}

/** Test accounts


Available Accounts
==================
(0) 0x8904f34e7e16857e3d909ead31af3ec746daf939
(1) 0xc32f901f5be3d8951704e630abbb6e5afbbec4fa
(2) 0x04491970c18fb891d8659c587729aa7d529cb5da
(3) 0xe3394182ce79fb56428c8e6f17ad85079e9f2b08
(4) 0xdec88668ffce8bbbe7b27f3a84db42cd4516b51b
(5) 0xac1b4590d41aa7c786b15f818b7ea5c628440b00
(6) 0x794c5ee1e12ce549ec21a57ade7b98cb393a6901
(7) 0x6318e7238352d780e7788276127b6eeeb8decac9
(8) 0xffd5a0d5f6dca6d5a0a0351f466d471658ad73e0
(9) 0xcb8229bea7bbf773e3a9c940af40a7670cf8e807

Private Keys
==================
(0) ed41b9ec00fbaf9b3fe57b94cba4f7a3bcbb632f11fcd9993700bd749e879830
(1) 12224808c0eaa68abca273c09ac68f6acb130a5163f99ff11fb5b9f7dfde3157
(2) d23dea67beb31e72abb40886b4c8350e8ad67de488015e2437460645f017505c
(3) 24e464becc3a1a86d2f844732897fc7ada95a4f187fab8f7513305bc2d31a44d
(4) 4e0d2ec72911f00ce56ae7d633bcd5ec7c9aa7af1c6858953202c4d21ced96af
(5) d25c6111f964bb350495d4fff620f43f34e67038c84c04eaad73715f8b9299f2
(6) e41be2aee15f060a1bf93aa3170ade77e5476e2b10140d40c3c145ff1e0f508e
(7) 4f4327be359ee6e91ec989078265792dc11949880f165986212d42f41ca98f9b
(8) e40433c338eb6d6bb5cc95e30f39663ecc4620a0960b873ca8ea23619247a364
(9) 52585916ff112c845833f9f147c1b21f202c45a9597f1c48937ce23aab89ecad

HD Wallet
==================
Mnemonic:      quote theme figure donate liquid walnut ginger leg bid fortune pony catch
Base HD Path:  m/44'/60'/0'/0/{account_index}

Listening on localhost:8545

 */