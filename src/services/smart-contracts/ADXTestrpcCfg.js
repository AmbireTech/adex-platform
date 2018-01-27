/* NOTE: Localhost config - works wit EthereumJS TestRPC v4.1.3 (ganache-core: 1.1.3)
 * sudo npm install -g ethereumjs-testrpc@4.1.3
 * adex-core yarn test (just exchange) (created contracts 2-token, 3-registry, 4-exchange)
 * acc (0) - 100ETH, 100 000 000 ADX
*/
export const testrpcCfg = {
    node: '//127.0.0.1:8545/',
    addr: {
        token: '0xcb7816516d16989a3151ef84316b9837ae0b4bc3',
        registry: '0x121497491fde8e9f4e94849af08b5a8462d0f242',
        exchange: '0xd5834ead04b5f49aee77ca4c7707a53bc7c40d82',
    }
}

export const testAcc = {
    addr: '0x3eee9a4aeadf5240ddec2d617619f06c463d806e',
    prKey: '0e70f114407303e9efb780fa00064dc4a7b9ae60ee2d4f825e2a84e0b49cd976'
}

/** Test accounts


Available Accounts
==================
(0) 0x3eee9a4aeadf5240ddec2d617619f06c463d806e
(1) 0x85df33b5bd0d951597cdbcef9954d8103ddecbeb
(2) 0x8d63dd79666af2324fdc5338dd9c0ccec9f9e7aa
(3) 0xc8a492d2636221aa5f22d22065e75209745a8b23
(4) 0x8f8df4f0eef21f06de54c07d7f09f5320f07292a
(5) 0x7c19fe26946c61f7db366695c1d7ad3154337190
(6) 0x986fcbe41ee1d603ff5a45cf20807ab62d60bd89
(7) 0xc228cf403e0410cc02046f6580ecada916f048ae
(8) 0xe59146ab87374ff33f239a7f6f305577a60f19e8
(9) 0xdc422b53684b9ecc1cc1444bfdaf7fb8a2869a8b

Private Keys
==================
(0) 0e70f114407303e9efb780fa00064dc4a7b9ae60ee2d4f825e2a84e0b49cd976
(1) 25c922a5d4e871d1f1e05ce6c8b8d1a948ad49895abb117d873efc784c3d4ef7
(2) 0ea3d8c2e38d3fd835299a523b7d4c175d7b2376bd7281574082d04df9341e62
(3) efdde55b54ce10a077df68ca22e31bb530c2f2c298f91a1a4bd952bb346a7d94
(4) 1acdb349efe522427f84947a5bc0452d571935a1762046e6b29fbcbb8b742034
(5) b86708ed78a6b298f23439228b1c6d59473be78aebd216ac8abda597ff5dbca0
(6) 259f6a17b6ba185f42d9556695dd8474e5bd739a3a554088925d197571d451d9
(7) 7d4232bd579bfc0b326cd5268f7f26d5f63595f70a448aa249a40e510015c134
(8) 1584de302f91705d20b32235611676ee14ed32a04add8c2fad2ebe061c879505
(9) cd6d0213a4f78b970efc227afa3ee3f4283dab4cd197ad63045d97a6f746d479

HD Wallet
==================
Mnemonic:      roof sock arm load minor stone hurt cute chicken mix short announce
Base HD Path:  m/44'/60'/0'/0/{account_index}

Listening on localhost:8545

 */