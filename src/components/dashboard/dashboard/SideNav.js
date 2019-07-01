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
import Icon from '@material-ui/core/Icon'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import CampaignIcon from 'components/common/icons/CampaignIcon'
import Translate from 'components/translate/Translate'
import { NewUnitDialog, NewCampaignDialog, NewSlotDialog } from 'components/dashboard/forms/items/NewItems'
import classnames from 'classnames'
import packageJson from './../../../../package.json'
import Anchor from 'components/common/anchor/anchor'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { SideSwitch } from './SideSwitch'
import AdexIconTxt from 'components/common/icons/AdexIconTxt'
import DashboardIcon from '@material-ui/icons/Dashboard'
import SwapHorizontalIcon from '@material-ui/icons/SwapHoriz'
import Badge from '@material-ui/core/Badge'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import AccountBoxIcon from '@material-ui/icons/AccountBox'

const RRListItem = withReactRouterLink(ListItem)
const { ETH_SCAN_ADDR_HOST } = process.env

class SideNav extends Component {

	shouldComponentUpdate(nextProps, nextState) {
		let langChanged = this.props.language !== nextProps.language
		let sideChanged = this.props.side !== nextProps.side
		let locationChanged = this.props.location.pathname !== nextProps.location.pathname
		let transactionsChanged = (this.props.transactions.pendingTxs || []).length !== (nextProps.transactions.pendingTxs || []).length
		let bidsAwaitingActionChanged = this.bidsAwaitingActionCount !== nextProps.bidsAwaitingActionCount
		return langChanged || sideChanged || locationChanged || transactionsChanged || bidsAwaitingActionChanged
	}

	render() {
		const { side, identity, t, transactions, classes } = this.props
		if (side !== 'advertiser' && side !== 'publisher') {
			return null
		}

		// TODO: test location
		const location = this.props.location.pathname.split('/')[3]
		const isAdvertiser = side === 'advertiser'
		const items = (isAdvertiser ? 'units' : 'slots')
		const NewItemBtn = (isAdvertiser ? NewUnitDialog : NewSlotDialog)
		const itemsIcon = (isAdvertiser ? 'format_list_bulleted' : 'format_list_bulleted')
		const pendingTrsCount = (transactions.pendingTxs || []).length

		return (
			<div
				className={classes.navigation}
			>
				<List
					classes={{
						padding: classes.sntPadding,
						root: classes.navListRoot
					}}
					className={classes.navList}
					component='nav'
				>
					<div>
						<div
							className={classnames(classes.toolbar, classes.sideNavToolbar)}
						>
							<ListItem>
								<AdexIconTxt
									className={classes.icon}
								/>
							</ListItem>
							<SideSwitch
								side={side}
								t={t}
							/>
						</div>
						<ListDivider />
						<RRListItem
							button
							to={{ pathname: '/dashboard/' + side }}
							className={classnames({ [classes.active]: !location })}
						>
							<ListItemIcon>
								<DashboardIcon />
							</ListItemIcon>
							<ListItemText inset primary={t('DASHBOARD')} />
						</RRListItem>
						<ListDivider
						/>
						{side === 'advertiser' &&
							<div>
								<RRListItem
									button
									to={{ pathname: '/dashboard/advertiser/campaigns' }}
									className={classnames({ [classes.active]: location === 'campaigns' })}
								>
									<ListItemIcon>
										<CampaignIcon />
									</ListItemIcon>
									<ListItemText inset primary={t('CAMPAIGNS')} />
								</RRListItem>

								<ListItem
									className={classes.newItemBtn}
								>
									<NewCampaignDialog
										className={classes.newItemBtn}
										color='primary'
										variant='contained'
									// btnClasses={classes.newItemBtn}
									/>
								</ListItem>
								<ListDivider />
							</div>
						}
						<RRListItem
							button
							to={{ pathname: '/dashboard/' + side + '/' + items }}
							className={classnames({ [classes.active]: location === items })}
						>
							<ListItemIcon>
								<Icon>{itemsIcon}</Icon>
							</ListItemIcon>
							<ListItemText inset primary={t(items.toUpperCase())} />
						</RRListItem>
						<ListItem
							className={classes.newItemBtn}
						>
							<NewItemBtn
								className={classes.newItemBtn}
								color='primary'
								variant='contained'
							/>
						</ListItem>
						<ListDivider
						/>

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
							<ListItemText inset primary={t('TRANSACTIONS')} />
                        </RRListItem> */}
					</div>
					<div>
						<Anchor target='_blank' href='https://medium.com/adex-network-tips-and-tricks' >
							<ListItem
								button
							>
								<ListItemIcon>
									<HelpOutlineIcon />
								</ListItemIcon>
								<ListItemText inset primary={t('HELP')} />
							</ListItem>
						</Anchor>

						<Anchor target='_blank' href={`${ETH_SCAN_ADDR_HOST + identity}`}>
							<ListItem
								button
							>
								<ListItemIcon>
									<SwapHorizontalIcon />
								</ListItemIcon>
								<ListItemText inset primary={t('TRANSACTIONS')} />
							</ListItem>
						</Anchor>

						<RRListItem
							button
							to={{ pathname: '/dashboard/' + side + '/account' }}
							className={classnames({ [classes.active]: location === 'account' })}
						>
							<ListItemIcon>
								<AccountBoxIcon />
							</ListItemIcon>
							<ListItemText inset primary={t('ACCOUNT')} />
						</RRListItem>
					</div>
				</List>
				<div
					className={classes.version}
				>
					<div className={classes.adxLink}>
						<small> &copy; {(new Date()).getFullYear()}  &nbsp;
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
								href={process.env.ETH_SCAN_ADDR_HOST + process.env.ADX_TOKEN_ADDR}
							>
								AdEx (ADX) Token
							</Anchor>
						</small>
						<small> / </small>
						<small>
							<Anchor
								className={classes.adxLink}
								target='_blank'
								href={process.env.ETH_SCAN_ADDR_HOST + process.env.ADEX_CORE_ADDR}
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
			</div >
		)
	}
}

SideNav.propTypes = {
	actions: PropTypes.object.isRequired
}

function mapStateToProps(state) {
	const { persist, /*memory*/ } = state

	return {
		// account: persist.account,
		transactions: persist.web3Transactions[persist.account._addr] || {},
		identity: persist.account.identity.address
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(withStyles(styles)(SideNav)))