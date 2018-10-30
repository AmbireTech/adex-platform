# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]

## [2.1.9] - 2018-10-28
### Added
- DEMO mode - temp address with limited access
- Keeping state for lists order props

### Changed
- Edit existing images with icon button instead with click on them

### Fixed
- Dashboard and misc styles
- Misc bug fixes

## [2.1.8] - 2018-09-05
### Added
- Switch button to turn ON/OFF filter by tags for slot open bids

## [2.1.7] - 2018-09-05
### Added
- View images in full size
- Validation on updating items

### Changed
- Changed styles - more responsive design

### Fixed
-  Misc styles and bug fixes

## [2.1.6] - 2018-08-13
### Fixed
- Misc bug fixes

## [2.1.5] - 2018-08-08
### Changed
- Temp using eth.personal.sign for MetaMask instead eth_signTypedData until the [issue](https://github.com/MetaMask/metamask-extension/issues/4975) is fixed

## [2.1.4] - 2018-08-07
### Added
- Toast when copy to clipboard btn is used

### Fixed
- minor bug fixes

## [2.1.3] - 2018-08-07
### Added 
- Tags for matching/filtering between bids/ad slots/ad units 

## [2.1.2] - 2018-07-26
### Added
- Support for Trezor new sign algorithm 
- Copy to clipboard buttons where needed

### Fixed
- Misc bugs and styles

## [2.1.1] - 2018-07-09
### Added
- [AirSwap widget](https://github.com/airswap/developers/tree/master/widget) to buy/sell ADX inside the dApp (from account page)

## [2.1.0] - 2018-06-26
### Added
- materia-ui components
- More responsive UI (not fully yet)

### Changed
- Remove react-toolbox components
- More simple UI
- Code refactoring

### Fixed
- Misc bugs and styles

## [2.0.13] - 2018-05-24
### Added
- Statistics for bids (charts and tables)
- Dashboard statistics
- CSV export for statistics

### Fixed
- Misc styles and bug fixes

## [2.0.12] - 2018-05-10
### Added
- Logout ot authentication error

### Fixed
- Authentication bug

## [2.0.11] - 2018-04-30
### Added
- Page to show all user bids (by role)
- New columns for bids tables (details/reports/ad slot/ad unit)
- Bids details popup
- Popup with ad unit/slot ipfs details at bid row
- Popup for bid ipfs report
- Svg circle with text for notifications
- Validations with checkbox for transaction that are possible but don't meet the criteria (Verify bid without target reached, refund when target reached, etc.)
- Bids spilled to Ready to verify/Open/Active/Closed
- Show bids ready to verify count on side nav

### Changed
- Common components for unit/slot bids

### Fixed
- Misc bugs and styles
- ADX exchange ABI
- Auth - getting addr stats auth type

## [2.0.10] - 2018-04-13
### Added
- Basic info for wallets authentication on signup
- Translations can accept insertion of components

### Fixed
- Styles

## [2.0.9] - 2018-04-12
### Added
- TREZOR and LEDGER hardware wallets authentication
- Transactions - new notifications
- Gas price dropdown on transactions preview
- Get current gas prices info from [ethgasstation.info]
- Show estimated gas costs on tx preview
- Tx preview notification for waiting user actions
- Common function to send transactions with different wallet
- Common function to sign messages wth different wallets
- Wallet logo before address on top bar
- Multiple transactions from one action sent to transactions page
- Error msgs formatter (e.g No more metamask ugly errors)

### Changed
- Show each transaction when multiple for one action (e.g. Deposit to exchange) on tx preview
- Code optimization
- Getting web3
- Tx preview minor styles changes

### Fixed
- Misc bug fixes

## [2.0.8] - 2018-03-26
### Added
- List items/bids - filter by property
- Items - archive/unarchive buttons and list controls
- Cancel button for new items/bids/transactions
- New items steps - meaningful steps names
- New translations 
- Link to AdEx site in side nav

### Changed
- Items - removed delete btn (now just archive, in future will be added delete btn but only for items with no related bids)
- Side nav styles

### Fixed
- List controls grid styles

## [2.0.7] - 2018-03-20
### Fixed
- Anchor getUrl
- fallbackAdUrl input
- crop images bugs

## [2.0.6] - 2018-03-19
### Added
- upload/edit images - crop and auto resize
- Anchor component

### Changed
- Images and links - not draggable (on Firefox links are still draggable)

### Fixed
- Images urls
- Validations ids

## [2.0.5] - 2018-03-15
### Added
- Changelog
- Separate component Save btn at Item HOC

### Changed
- Notifications translations
- Item HOC re render fix
- README

## [2.0.4] - 2018-03-14
### Added
- Edit Campaign/Channel/AdSlot logo(avatar)  
- Edit Ad slot fallback ad url and fallback ad image
- Translations for item actions notifications (create/remove/update etc..)
- Help link on Side navigation

### Changed
- Functions from Translation component moved to service
- Item actions refactored code

## [2.0.3] - 2018-03-03
### Added
- Links to AdEx ethereum contract on side navigation
- Edit Items (name, description, etc..)
- Validation for placing/accepting bids (check for available deposit)
- Deposit warning message (for multiple transactions needed)

### Changed
- Webpack production config - use query hash for bundled files

## [2.0.2] - 2018-03-01
### Added
- Showing pending transactions on side navigation
- New translations
- Showing pending bids actions

### Changed
- Side navigation new styles
- Transactions styles and flow

### Fixed 
- Misc bug fixes
- Code cleanup

## [2.0.1] - 2018-02-27
### Added
- New translations

### Fixed 
- Misc bug fixes

## 2.0.0 - 2018-02-26

[Unreleased]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.1.9...HEAD
[2.1.9]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.1.8...v2.1.9
[2.1.8]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.1.7...v2.1.8
[2.1.7]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.1.6...v2.1.7
[2.1.6]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.1.5...v2.1.6
[2.1.5]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.1.4...v2.1.5
[2.1.4]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.1.3...v2.1.4
[2.1.3]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.1.2...v2.1.3
[2.1.2]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.0.13...v2.1.0
[2.0.13]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.0.12...v2.0.13
[2.0.12]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.0.11...v2.0.12
[2.0.11]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.0.10...v2.0.11
[2.0.10]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.0.9...v2.0.10
[2.0.9]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.0.8...v2.0.9
[2.0.8]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.0.7...v2.0.8
[2.0.7]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.0.6...v2.0.7
[2.0.6]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.0.5...v2.0.6
[2.0.5]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.0.4...v2.0.5
[2.0.4]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.0.3...v2.0.4
[2.0.3]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.0.2...v2.0.3
[2.0.2]: https://github.com/AdExBlockchain/adex-dapp/compare/7a8ba665907351a99290ef77e1f0ffbee080dd95...v2.0.2
[2.0.1]: https://github.com/AdExBlockchain/adex-dapp/compare/20bc85bcf3797d86c951aa63cd5c568d3c5b5e6d...7a8ba665907351a99290ef77e1f0ffbee080dd95

[ethgasstation.info]: https://ethgasstation.info/