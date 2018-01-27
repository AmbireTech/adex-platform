/* NOTE: Localhost config - works wit EthereumJS TestRPC v4.1.3 (ganache-core: 1.1.3)
 * sudo npm install -g ethereumjs-testrpc@4.1.3
 * adex-core yarn test (just exchange) (created contracts 2-token, 3-registry, 4-exchange)
 * acc (0) - 100ETH, 100 000 000 ADX
*/
export const testrpcCfg = {
    node: '//127.0.0.1:8545/',
    addr: {
        token: '0xdb1bac5e5c47f630188c5acce9eb69e1f4374961',
        exchange: '0x5322d8c5fbddd4f6c3f9684d2c481d9d44541f3d',
    }
}

export const testAcc = {
    addr: '0x7ec95bc5cc0c41bc4699ecf6b0071f3e8c33b810',
    prKey: '8d62ae5e0c93320c367bf3d1cb5790fcdeac1366a863b442c3cc69d1b176d23e'
}

/** Test accounts

Available Accounts
==================
(0) 0x7ec95bc5cc0c41bc4699ecf6b0071f3e8c33b810
(1) 0xaef7e81876671eea97b8d02226e6760606300089
(2) 0x6958f339ba1060468e3020dfa98d41d36586188f
(3) 0x48d157b2a129a2504b91869956b34fa31dce7c7c
(4) 0x48364e4dea32959398dc27f07ebc3acd0faf1402
(5) 0xd953e8380fa0854d4652c489a3c54f97b3d6fa8f
(6) 0x82dfecab1780010a9c5d5a81b2561d2882b19ee4
(7) 0x35a958e510431a0b6ba33e9043edc6b6d2963b5a
(8) 0xbdda99044d7a0a4f67c88b3842e96e4248c75350
(9) 0x609906b399926fa0d590402c84b5945a7a1fd763

Private Keys
==================
(0) 8d62ae5e0c93320c367bf3d1cb5790fcdeac1366a863b442c3cc69d1b176d23e
(1) d489ed41a5c65c7acf2fbffd315deb5571a23c58ba280a3084b0f52f9f159682
(2) 6e344f6aec4b0b09c2b55097260324be736c22ac7c47041b0c1af3225fa124ca
(3) b887b7c3896d7de7526853136e3a2c1a9b896ee367a9df773b692805313285cc
(4) 05f8ade4a443ab234d8df7b000cdfb120e2d59d724b6dfe853cb8d9e5aa20751
(5) 8085a36eec385c8b611e78b8cfd5b305ce402fc5c7a1c8899f173feb8e73fb5e
(6) 46e82e8057c8bd80199d12c5c08a213c9f7559e72c4d3736297c76009f96f688
(7) b8ec019fda0b7a1bfa2827c9a2cc09aca4d3a8abe61d4c261a0b0eb13a6c285e
(8) d907f99bfae6f1cd8b8eaacd75d229184469c2ca8a5c07b44b7d96594bc1191f
(9) 6467a5c01b36750c587bbf06566b2d3b629796f12ca28e5103eef094de392d37

HD Wallet
==================
Mnemonic:      piano box hill eye glove cotton crunch smooth mansion shaft another exhibit
Base HD Path:  m/44'/60'/0'/0/{account_index}
Listening on localhost:8545

 */