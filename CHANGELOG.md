# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]

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

[Unreleased]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.0.10...HEAD
[2.0.9]: https://github.com/AdExBlockchain/adex-dapp/compare/v2.0.9...v2.0.10
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