# Changelog
All notable changes to this project will be documented in this file.


## 4.20.52
##### *2021-01-04*

### Fixed
- ENS username validation
- Stepper steps validation

### Changed
- Trimmed inputs

## 4.20.51
##### *2020-12-23*

### Changed
- Getting started guide fot publishers
- Network issues detection texts

## 4.20.50
##### *2020-12-22*

### Added
- Ad blocker and network errors detection
- ENS username string validation and info
- GA events on some buttons click

### Fixed
- Large video upload dropzone styles

## 4.20.49
##### *2020-12-21*

### Added
- Dark theme
- Ability to update min and max CPM of active campaigns
- Campaigns "Paused" status

### Fixed
- Targeting rules
- Password error message on sign-up
- Campaign date validation
- Campaigns table sorting by CPM
- Campaign location and devices targeting validation
- Misc small bugs

## 4.20.48
##### *2020-09-17*

### Fixed
- Login label and continue as button

### Changed
- Ramp top up order and title

## 4.20.47
##### *2020-09-10*

### Fixed
- Withdraw other tokens action

## 4.20.46
##### *2020-08-28*

### Fixed
- Typo

## 4.20.45
##### *2020-08-28*

###  Fixed
- Transactions fees validation display
- Campaign amounts validations deposit/CPMs

### Changed
- Transactions fees breakdown

## 4.20.44
##### *2020-08-27*

### Fixed
- New version reload btn

## 4.20.43
##### *2020-08-27*

### Added
- Devices targeting preview

### Changed
- Devices targeting groups

### Fixed
- Typos

## 4.20.42
##### *2020-08-27*
- Total and available balances (Transactions use sweeps from campaigns with sufficient balance for the fees)

## 4.20.41
##### *2020-08-26*

### Added
- Targeting by device
- Websites DNS TXT fast instructions
- Withdraw address warnings
- "Scheduled" campaign status
- Tooltips to campaign status icons

### Fixed
- Styles
- MetaMask on mobile

## 4.20.40
##### *2020-08-21*

### Added
- UserSide prop to identity meta
- Auto redirect to user side on login - from meta ot last selected by user
- New websites button with steps on websites page

### Changed
- Updated trezor-connect
- Min slots CPM with included validators fee in the rules
- Tooltips styles

### Fixed
- Packages update, cleanup and fix
- Dropdown loading progress
- Terms and conditions link
- External link styles
- Page reloading state check
- Toast component

## 4.20.39
##### *2020-08-17*

### Added
- Google analytics dimensions
- Intrusive notification for new release

### Changed
- `react-ga` instead google script
- Cache buster
- Upgraded `ethers` pkg - migration from v4 to v5
- Using websocket for our web3 provider

### Fixed
- Removed react routes used twice
- Top-up page responsiveness
- Audience input on campaign details

## 4.20.38
##### *2020-08-13*

### Changed
- Removed old analytics revenue info alert 

## 4.20.37
##### *2020-08-13*

### Fixed
- Analytics year timeframe

## 4.20.36
##### *2020-08-13*

### Added
- Month and year timeframes for the analytics
- Analytics start and end period limits
- Transak top-up integration
- Message for applied fees when closing campaign
- Fees breakdown
- Base fees from relayer config
- Sync user and relayed data before every web3 action

### Changed
- Analytics data to be displayed for the past timefreame period
- All analytics time periods in the local timezone instead of UTC
- Removed analytics revenue cutoff
- Top-up page
- ADX token address
- MetaMask API updated
- Show balance as is - no min, no fees for outstanding balances
- No pre calculated fees for outstanding balances
- Using only our web3 node provider for read actions

### Fixed
- Misc ui bugs
- Misc styles
- Ramp top-up modal
- Campaign pricing bounds auto update
- Side nav layout
- MetaMask log out bug


## 4.20.35
##### *2020-07-22*

### Fixed
- Slot rules on creating and updating

## 4.20.34
##### *2020-07-20*

### Added
- `login-select-identity` query param on login to filter wallet identities

## 4.20.33
##### *2020-07-17*

### Fixed
- Misc minor bugs and translations

## 4.20.32
##### *2020-07-16*

### Changed
- Update `adex-models` version 

## 4.20.31
##### *2020-07-16*

### Added
- Info link for targeting country tiers

### Changed
- Default validator fee from 5% to 7%
- Advanced targeting tules moved from audience to Campaign parameters
- Autocomplete/dropdown options tooltips are now with info icon

### Fixed
- Misc bugs and typos

## 4.20.30
##### *2020-07-15*

### Fixed
- Campaign pause/resume

## 4.20.29
##### *2020-07-15*

### Added
- Ability to manually set and update min CPM for slots
- Ability enable/disable showing adult content on slots 

### Changed
- Tabs and charts styles and layout

### Fixed
- Quality when image is uploaded and cropped

## 4.20.28
##### *2020-07-13*

### Fixed
- Layout styles on safari browsers (mac and ios)
- Recommended ad units formats

### Changed
- Stats chart styles and responsiveness

## 4.20.27
##### *2020-07-10*

### Added
- Added ability to archive Slots, Units and Audiences

## 4.20.26
##### *2020-07-09*

### Added
- Groups by ad formats popularity at unit creation
- Ability to edit saved audience title
- Show min and max CPM at campaign details

### Changed
- Show 'Pending' instead 'Active' when campaign is not deployed
- Misc labels and translations

### Fixed
- Fixed bug with audience inputs

## 4.20.25
##### *2020-07-07*

### Added
- Optional `utm_source=adex_PUBHOSTNAME` for campaign units
- Non filtered targeting data for exclusion inputs
- Targeting data filtering by publishers revenue
- Better sorting in targeting inputs when there are disabled values

### Fixed
- Crash when cancel on campaign finance step

## 4.20.24
##### *2020-07-03*

### Fixed
- Campaign pricing bounds

## 4.20.23
##### *2020-07-03*

### Fixed
- Opening campaign

## 4.20.22
##### *2020-07-03*

### Fixed
- Campaign update
- Audience inputs sorting
- Misc bugs

## 4.20.21
##### *2020-07-02*

### Added
- Ability to blacklist publishers from the "by website" statistics
- Average CPM column to campaigns by website and by country statistics
- Slot demand warning on new slot preview id no active campaigns

### Fix
- Opening campaign
- Misc bugs

## 4.20.20
##### *2020-07-01*

### Fixed
- Targeting rules from input when all countries is selected
- Disabled values between categories and publishers when 'ALL' selected

## 4.20.19
##### *2020-06-30*

### Changed
- Hide campaign audience update btn when inactive

### Fixed
- Updating legacy campaigns audience
- Misc bug fixes

## 4.20.18
##### *2020-06-30*

### Added
- Ability to pause/resume campaign
- Confirm dialog and spinner for campaign close/pause/resume buttons
- Created and Updated columns at Audiences table

### Fixed
- Styles

## 4.20.17
##### *2020-06-29*

### Added
- Auto suggested CPM-s for campaigns and slots
- Sots rules
- More validations
- Toasts on items update

### Fixed
- Misc audience bugs

## 4.20.16
##### *2020-06-22*

### Added
- Audience categories with min slots count filter
- Error icons on audience tabs when error
- Audience inputs Categories to Publishers and vice versa filtering

### Changed
- Audience input selected values hidden instead disabled when not selected

### Fixed
- Misc minor bugs

## 4.20.15
##### *2020-06-18*

### Added
- Targeting on campaign level
- Audiences page and table

### Changed
- Removed targeting on Ad Units and Ad slots level
- UTM tags on campaign instead on ad unit
- Websites page - no legend

### Fixed
- Slot fallback update

## 4.20.14
##### *2020-06-03*

### Fixed
- Autocomplete component

## 4.20.13
##### *2020-06-01*

### Changed
- removed website integration issue

### Fixed
- Typos

## 4.20.12
##### *2020-05-29*

### Changed
- Slot website input - UX drama hotfix

## 4.20.11
##### *2020-05-26*

### Fixed
- Changelly integration 

## 4.20.10
##### *2020-05-26*

### Changed
- dropped SAI

## 4.20.9
##### *2020-05-19*

### Fixed
- Metamask auth bug

## 4.20.8
##### *2020-05-19*

### Added
- Changelly BTC to DAI swap widget
- List all privileges on account info page
- Remove buttons for listed emails on login screen

### Fixed
- Login w/o privileges
- Css

## 4.20.7
##### *2020-05-13*

### Added
- Publisher websites page
- Retry verification for website in slot details

### Changed
- Autocomplete with creation for slot website input

## 4.20.6
##### *2020-05-07*

### Fixed
- Receipts styles

### Changed
- Receipts preview visible on mobile

## 4.20.5
##### *2020-05-07*

### Fixed
- Misc bugs, styles and translations

## 4.20.4
##### *2020-05-06*

### Changed
- Layout and floating buttons
- Default buttons
- Misc styles
- Mobile stepper

### Fixed
- Misc bugs and styles

## 4.20.3
##### *2020-05-05*

### Changed
- Layout
- FAB buttons are now sticky 
- Styles

### Fixed
- Translations
- Misc small bugs

## 4.20.2
##### *2020-05-04*

### Added
- Slot passback data edit
- Progress on items tables loading

### Changed
- Theme colors
- Misc styles
- Toasts styles and colors
- Chart stats - removed legend, hide data with click on cards
- Initial data loading
- Removed publisher verification message


### Fixed
- Image component bugs and styles
- Image crop
- Bug with targeting input
- Misc small bugs


## 4.20.1
##### *2020-04-23*

### Added
- Campaigns chart analytics by time frame
- Added statistics to slots table
- Top uo page
- 'Wyre' integration
- 'PayTrie' integrations

### Changed
- Removed Ledger
- All login components with hooks
- Embedded 'Roboto' font

### Fixed
- Tables update
- Misc small bugs
- Code and warnings cleanup

## 4.20.0
##### *2020-04-20*

### Added
- v4.20.0

### Changed
- Perception

### Fixed
- Nothing

## 4.10.49
##### *2020-04-17*

### Changed
- Items data moved to persist again

## 4.10.48
##### *2020-04-17*

### Changed
- Steps inputs styles - outlined (items, transactions, login)
- Steps previews - more compact with grids, better order of props

### Fixed
- Typos
- Styles
- Code cleanup

## 4.10.47
##### *2020-04-16*

### Added
- Validation for ad units targeting
- Validation on campaign with "Only show ad if targeting matches" checked
- Display message for impressions but no revenue

### Changed
- Preview props styled as outlined input
- Improved chart styles and usability on mobile

### Fixed
- Campaign close
- Targeting input styles and responsiveness
- Fixed analytics data loading

## 4.10.46
##### *2020-04-14*

### Added
- Analytics timeframe and period selectors by side

### Changed
- Analytics optimized #428 and #436
- Styles:
  - Smaller max content width
  - Smaller table images
- Items, analytics and channel store moved to memory store

### Fixed
- Analytics misc bugs
- Tables and other misc styles

## 4.10.45
##### *2020-04-09*

### Added
- Export receipts for publishers #412
- Analytics select time period for time frames #418
- Analytics chart NOW annotation
- Date utils for date operations
- Week start aggregations with locale

### Changed
- Getting  started guide progress icons ans styles
- Hide getting started for each side separately
- Publisher/Advertiser color scheme
- Analytics updated on 60 seconds instead 120 (will be optimized in next version)
- Big code refactoring #417:
  - Stepper accepts validation and complete functions instead passing components
  - Stepper styles with `flex` - no more `absolute` inside
  - Web3 transactions steps (Withdraw tokens, Set privileges, Set ENS), new items steps (Campaigns, Slot, Unit), Item details pages (Campaigns Slots, Unit) - now are w/o HOCs, using hooks only (except for Dialog Hoc), selectors and actions. Validations using actions for the whole step/details page.
  - Updated details pages layout and styles
- Layout and misc styles updated
- Updated versions of material-ui packages
- Code cleanup

### Fixed
- Ad units selector bug when loaded from old versions state
- Passback/fallback wording fix #425



## 4.10.44
##### *2020-03-26*

### Added
- Country-based statistics: publisher & advertiser
- Statistic about which campaigns/units you are earning the most from
- How did you hear about AdEx field on sign up
- Notification if the Ethereum network is clogged
- Warning instead integration code in slot details when email is not confirmed

### Changed
- Side switch colors
- Slot website issues - displayed with warning alerts

### Fixed
- Top right menu misbehavior
- Misc selectors, styles and minor bugs

## 4.10.43
##### *2020-03-16*

### Fixed
- Slot websites issues

## 4.10.42
##### *2020-03-16*

### Added
- Showing slot website host issues on slot create preview and slot details

### Changes
- Slots request returns slots and websites
- Getting started styles
- Publisher revenue alert condition - hidden if there is website with no issues or any impressions

### Fixed
- Breadcrumbs casing (Added translations)
- Breadcrumbs - no link if only one element
- Removed misc unused variables

## 4.10.41
##### *2020-03-11*

### Changed
- Getting started styles
- Publisher revenue warning condition (show only if no impressions)
- Removed wallet backup button

### Fixed
- Top/Bide bars styles
- Campaign preview units table
- Misc styles, bugs, error and warnings

## 4.10.40
##### *2020-03-10*

### Added
- Clickable breadcrumbs in top bar (better than #307)
- CTR and name on campaigns table #371
- Campaigns statistics - ad unit breakdown by impressions/clicks/CTR #362
- Link to TOS #383


### Changed
- Changelog link
- Broken Navbar title replaced with breadcrumbs
- Confirm component - show cancel/confirm buttons only if labels provided
- Translations are joined when all parts are string or numbers

### Fixed
- Tutorials #390
- Table data selectors
- Item update validation
- Updating slots (rare case)
- App crash on receipt with invalid campaign id
- Page not found style
- Top bar styles
- Code cleanup


## 4.10.39
##### *2020-03-09*

### Added
- Progress indication for fees in new campaign preview

### Changed
- Campaigns increased ip limit `timeframe`
- `material-ui-pickers` with `@material-ui/pickers`
- Hotjar is removed
- Bumped `prop-types`

### Fixed
- Images sometimes are missing or wrong (fixed tables custom render functions)
- New campaigns disappear while initializing if page is refreshed 

## 4.10.38
##### *2020-03-06*

### Added
- Data loops auto stop check functions

### Fixed
- Possible logout on page refresh
- MetaMask account change check
- Missing data points with hour timeframe analytics chart
- Switch speed and animation between advertiser and publisher


## 4.10.37
##### *2020-03-05*

### Changed
- Getting started guide can be collapsed/expanded
- Removed revenue alert close button

### Fixed
- Getting started steps for publisher slots and impressions
- Dashboard alerts and content styles

## 4.10.36
##### *2020-03-05*

### Added
- Website filed on slot creation #378
- TOS change notification

### Fixed
- Email validation #354
- Campaigns blank page #373
- Styles
- Code cleanup
- Missing keys for translations components args
- Components translations with tags
- Publishers revenue notice

## 4.10.35
##### *2020-03-02*

### Added
- Getting started guide
- Publishers revenue warning alert
- Translations sanitization

### Changed
- Translations interpolations (updated components args usage)
- Ui styles

### Fixed
- Email validation
- Misc bugs and styles

## 4.10.34
##### *2020-02-24*

### Added
- Better validation on withdraw
- Reset transactions on logout

### Changed
- Domains configuration (blocked by ad blockers)
- Refactored withdraw step
- Channels selectors and reducers
- Formatting amounts truncated to fixed instead rounded

### Fixed
- Fixed bug with withdraw funds from account
- Label with fees on campaign params page #350 

## 4.10.33
##### *2020-02-19*

### Fixed
- Average CPM calculation

## 4.10.32
##### *2020-02-19*

### Fixed
- Withdraw bug
- Closing account type alert
- Publisher analytics race condition bug

## 4.10.31
##### *2020-02-19*

### Added
- Direct redirect to sides when account created `go-to-side=advertiser/publisher` #77

### Fixed
- Email validation on account creation - checking for existing emails before registration attempt
- Hide 'hidden' filters for data export


## 4.10.30
##### *2020-02-19*

### Fixed
- MetaMask network cfg

## 4.10.29
##### *2020-02-19*

### Added
- Print/Export campaigns receipts #332
- Global and by account ui states

### Fixed
- Payout analytics - more accurate calculation of Expired campaigns
and removed data points whit zero available earnings #345
- Campaign details z-index bug with tabs and app bar

## 4.10.28
##### *2020-02-17*

### Fixed
- Withdraw with sweeping bug

## 4.10.27
##### *2020-02-17*

- sync outstanding balances with analytics `eventsPayouts` #317
- safe calculation of validator fees
- use advanced analytics for channels clicks and impressions #335
- make data loop start method `async`

## 4.10.26
##### *2020-02-14*

- update identity data from relayer on dashboard load
- change `ENS` to `username`
- changed help link #338
- show only targeting matches on campaign details #339
- remove facebook chat

## 4.0.0
##### *2019-17-04*

### Added
- Metamask address verification
- Networks and tokes configuration
- Contracts configuration
- Styles to identity step
- Fee token amount field
- Toast when metmask is not on mainnet 
- Possibility to select acount type
- Adex Identity support
- Coupon code validator
- Set targeting added to adunit view
- Toast on error with error message
- Grant account Login
- Adunit preview 
- Campaign preview
- IPFS images handling
- Camapign max deposit validation
- Date time picker for campaign creation

### Fixed
- Identity owner state
- Trezor signin 
- Image uploading
- Top bar

### Changed
- Account page view changed
- Dashboard view 

### Removed
- AirSwap
- Ledger signin

## 2.2.3
##### *2019-01-16*

### Added 
- Sentry

### Fixed
- Legacy dapp browsers bug

## 2.2.2
##### *2019-01-07*

### Changed
- we3 node changed to infura

### Fixed
- Getting address balance
- Random Seed Generator

## 2.2.1
##### *2018-12-19*

### Fixed
- Service worker
- Adding build to ipfs

## 2.2.0
##### *2018-12-12*

### Changed
- Updated react dependencies
- Using babel 7 and webpack 4
- Stop using yarn for npm + lock file

### Fixed
- MetaMask use injected ethereum instead web3
- MetaMask account change detected with the new event listener (no more interval check)
- Ledger connection
- Misc bug fixes

## 2.1.9
##### *2018-10-28*

### Added
- DEMO mode - temp address with limited access
- Keeping state for lists order props

### Changed
- Edit existing images with icon button instead with click on them

### Fixed
- Dashboard and misc styles
- Misc bug fixes

## 2.1.8
##### *2018-09-05*

### Added
- Switch button to turn ON/OFF filter by tags for slot open bids

## 2.1.7
##### *2018-09-05*

### Added
- View images in full size
- Validation on updating items

### Changed
- Changed styles - more responsive design

### Fixed
-  Misc styles and bug fixes

## 2.1.6
##### *2018-08-13*

### Fixed
- Misc bug fixes

## 2.1.5
##### *2018-08-08*
### Changed
- Temp using eth.personal.sign for MetaMask instead eth_signTypedData until the [issue](https://github.com/MetaMask/metamask-extension/issues/4975) is fixed

## 2.1.4
##### *2018-08-07*

### Added
- Toast when copy to clipboard btn is used

### Fixed
- minor bug fixes

## 2.1.3
##### *2018-08-07*

### Added 
- Tags for matching/filtering between bids/ad slots/ad units 

## 2.1.2
##### *2018-07-26*

### Added
- Support for Trezor new sign algorithm 
- Copy to clipboard buttons where needed

### Fixed
- Misc bugs and styles

## 2.1.1
##### *2018-07-09*

### Added
- [AirSwap widget](https://github.com/airswap/developers/tree/master/widget) to buy/sell ADX inside the dApp (from account page)

## 2.1.0
##### *2018-06-26*

### Added
- materia-ui components
- More responsive UI (not fully yet)

### Changed
- Remove react-toolbox components
- More simple UI
- Code refactoring

### Fixed
- Misc bugs and styles

## 2.0.13
##### *2018-05-24*

### Added
- Statistics for bids (charts and tables)
- Dashboard statistics
- CSV export for statistics

### Fixed
- Misc styles and bug fixes

## 2.0.12
##### *2018-05-10*

### Added
- Logout ot authentication error

### Fixed
- Authentication bug

## 2.0.11
##### *2018-04-30*

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

## 2.0.10
##### *2018-04-13*

### Added
- Basic info for wallets authentication on signup
- Translations can accept insertion of components

### Fixed
- Styles

## 2.0.9
##### *2018-04-12*

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

## 2.0.8
##### *2018-03-26*

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

## 2.0.7
##### *2018-03-20*

### Fixed
- Anchor getUrl
- fallbackAdUrl input
- crop images bugs

## 2.0.6
##### *2018-03-19*

### Added
- upload/edit images - crop and auto resize
- Anchor component

### Changed
- Images and links - not draggable (on Firefox links are still draggable)

### Fixed
- Images urls
- Validations ids

## 2.0.5
##### *2018-03-15*

### Added
- Changelog
- Separate component Save btn at Item HOC

### Changed
- Notifications translations
- Item HOC re render fix
- README

## 2.0.4
##### *2018-03-14*

### Added
- Edit Campaign/Channel/AdSlot logo(avatar)  
- Edit Ad slot fallback ad url and fallback ad image
- Translations for item actions notifications (create/remove/update etc..)
- Help link on Side navigation

### Changed
- Functions from Translation component moved to service
- Item actions refactored code

## 2.0.3
##### *2018-03-03*

### Added
- Links to AdEx ethereum contract on side navigation
- Edit Items (name, description, etc..)
- Validation for placing/accepting bids (check for available deposit)
- Deposit warning message (for multiple transactions needed)

### Changed
- Webpack production config - use query hash for bundled files

## 2.0.2
##### *2018-03-01*

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

## 2.0.1
##### *2018-02-27*

### Added
- New translations

### Fixed 
- Misc bug fixes

## 2.0.0 - 2018-02-26

[ethgasstation.info]: https://ethgasstation.info/
