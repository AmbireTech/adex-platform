import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListDivider from '@material-ui/core/Divider'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import CampaignIcon from 'components/common/icons/CampaignIcon'
import Translate from 'components/translate/Translate'
import classnames from 'classnames'
import packageJson from './../../../../package.json'
import Anchor from 'components/common/anchor/anchor'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { SideSwitch } from './SideSwitch'
import AdexIconTxt from 'components/common/icons/AdexIconTxt'
import DashboardIcon from '@material-ui/icons/Dashboard'
import SwapHorizontalIcon from '@material-ui/icons/SwapHoriz'
// import Badge from '@material-ui/core/Badge'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import AccountBoxIcon from '@material-ui/icons/AccountBox'
import ListIcon from '@material-ui/icons/List'
import { LoadingSection } from 'components/common/spinners'

const RRListItem = withReactRouterLink(ListItem)
const { ETH_SCAN_ADDR_HOST } = process.env

class SideNav extends Component {
	shouldComponentUpdate(nextProps, nextState) {
		const thisProps = this.props
		const langChanged = thisProps.language !== nextProps.language
		const sideChanged = thisProps.side !== nextProps.side
		const locationChanged =
			thisProps.location.pathname !== nextProps.location.pathname
		const transactionsChanged =
			(thisProps.transactions.pendingTxs || []).length !==
			(nextProps.transactions.pendingTxs || []).length
		const bidsAwaitingActionChanged =
			this.bidsAwaitingActionCount !== nextProps.bidsAwaitingActionCount
		const balanceChanged =
			(this.props.account.stats.formatted || {}).availableIdentityBalanceDai !==
			(nextProps.account.stats.formatted || {}).availableIdentityBalanceDai

		return (
			langChanged ||
			sideChanged ||
			locationChanged ||
			transactionsChanged ||
			bidsAwaitingActionChanged ||
			balanceChanged
		)
	}

	render() {
		const {
			side,
			identity,
			t,
			// transactions,
			classes,
			account,
		} = this.props
		if (side !== 'advertiser' && side !== 'publisher') {
			return null
		}

		// TODO: test location
		const location = this.props.location.pathname.split('/')[3]
		const isAdvertiser = side === 'advertiser'
		const items = isAdvertiser ? 'units' : 'slots'
		// const pendingTrsCount = (transactions.pendingTxs || []).length
		const { availableIdentityBalanceDai } = account.stats.formatted || {}

		return (
			<div className={classes.navigation}>
				<List
					classes={{
						padding: classes.sntPadding,
						root: classes.navListRoot,
					}}
					className={classes.navList}
					component='nav'
				>
					<div>
						<div
							className={classnames(classes.toolbar, classes.sideNavToolbar)}
						>
							<ListItem>
								<AdexIconTxt className={classes.icon} />
							</ListItem>
							<ListItem>
								<LoadingSection
									loading={
										!availableIdentityBalanceDai &&
										availableIdentityBalanceDai !== 0
									}
								>
									<ListItemText
										primary={`${parseFloat(
											availableIdentityBalanceDai || 0
										).toFixed(2)} DAI`}
									/>
								</LoadingSection>
							</ListItem>
						</div>
						<ListDivider />
						<SideSwitch side={side} t={t} />
						<ListDivider />
						<RRListItem
							button
							to={{ pathname: '/dashboard/' + side }}
							className={classnames({ [classes.active]: !location })}
						>
							<ListItemIcon>
								<DashboardIcon />
							</ListItemIcon>
							<ListItemText primary={t('DASHBOARD')} />
						</RRListItem>
						<ListDivider />
						{side === 'advertiser' && (
							<>
								<RRListItem
									button
									to={{ pathname: '/dashboard/advertiser/campaigns' }}
									className={classnames({
										[classes.active]: location === 'campaigns',
									})}
								>
									<ListItemIcon>
										<CampaignIcon />
									</ListItemIcon>
									<ListItemText primary={t('CAMPAIGNS')} />
								</RRListItem>
								<ListDivider />
							</>
						)}
						<RRListItem
							button
							to={{ pathname: '/dashboard/' + side + '/' + items }}
							className={classnames({ [classes.active]: location === items })}
						>
							<ListItemIcon>
								<ListIcon />
							</ListItemIcon>
							<ListItemText primary={t(items.toUpperCase())} />
						</RRListItem>
						<ListDivider />

						{/* <RRListItem
							button
							to={{ pathname: '/dashboard/' + side + '/transactions' }}
							className={classnames({ [classes.active]: location === 'transactions' })}
						>
							<ListItemIcon>
								<span>
									{pendingTrsCount > 0 ?
										<Badge
											badgeContent={pendingTrsCount <= 9 ? pendingTrsCount : '9+'}
											color="primary"
											className={classnames(classes.actionCount)}
										>
											<SwapHorizontalIcon />
										</Badge> : <SwapHorizontalIcon />}
								</span>
							</ListItemIcon>
							<ListItemText primary={t('TRANSACTIONS')} />
                        </RRListItem> */}
					</div>
					<div>
						<Anchor
							target='_blank'
							href='https://medium.com/adex-network-tips-and-tricks'
						>
							<ListItem button>
								<ListItemIcon>
									<HelpOutlineIcon />
								</ListItemIcon>
								<ListItemText primary={t('HELP')} />
							</ListItem>
						</Anchor>

						<Anchor target='_blank' href={`${ETH_SCAN_ADDR_HOST + identity}`}>
							<ListItem button>
								<ListItemIcon>
									<SwapHorizontalIcon />
								</ListItemIcon>
								<ListItemText primary={t('TRANSACTIONS')} />
							</ListItem>
						</Anchor>

						<RRListItem
							button
							to={{ pathname: '/dashboard/' + side + '/account' }}
							className={classnames({
								[classes.active]: location === 'account',
							})}
						>
							<ListItemIcon>
								<AccountBoxIcon />
							</ListItemIcon>
							<ListItemText primary={t('ACCOUNT')} />
						</RRListItem>
					</div>
				</List>
				<div className={classes.version}>
					<div className={classes.adxLink}>
						<small>
							{' '}
							&copy; {new Date().getFullYear()} &nbsp;
							<Anchor
								className={classes.adxLink}
								target='_blank'
								href={process.env.ADEX_SITE_HOST}
							>
								AdEx Network OÜ
							</Anchor>
						</small>
					</div>
					<div>
						<small>
							<Anchor
								className={classes.adxLink}
								target='_blank'
								href={
									process.env.ETH_SCAN_ADDR_HOST + process.env.ADX_TOKEN_ADDR
								}
							>
								AdEx (ADX) Token
							</Anchor>
						</small>
						<small> / </small>
						<small>
							<Anchor
								className={classes.adxLink}
								target='_blank'
								href={
									process.env.ETH_SCAN_ADDR_HOST + process.env.ADEX_CORE_ADDR
								}
							>
								AdExCore
							</Anchor>
						</small>
					</div>
					<div>
						<small>
							<Anchor
								className={classes.adxLink}
								target='_blank'
								href='https://github.com/AdExBlockchain/adex-dapp/blob/master/CHANGELOG.md'
							>
								v.{packageJson.version}-beta
							</Anchor>
						</small>
					</div>
				</div>
			</div>
		)
	}
}

SideNav.propTypes = {
	actions: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
	const { persist, router } = state

	return {
		account: persist.account,
		transactions: persist.web3Transactions[persist.account._addr] || {},
		identity: persist.account.identity.address,
		location: router.location,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch),
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(withStyles(styles)(SideNav)))
