import React from 'react'
import { useSelector } from 'react-redux'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListDivider from '@material-ui/core/Divider'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import CampaignIcon from 'components/common/icons/CampaignIcon'
import classnames from 'classnames'
import packageJson from './../../../../package.json'
import Anchor from 'components/common/anchor/anchor'
import { styles } from './styles'
import SideSwitch from './SideSwitch'
import AdexIconTxt from 'components/common/icons/AdexIconTxt'
import DashboardIcon from '@material-ui/icons/Dashboard'
import SwapHorizontalIcon from '@material-ui/icons/SwapHoriz'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import AccountBoxIcon from '@material-ui/icons/AccountBox'
import ListIcon from '@material-ui/icons/List'
import { makeStyles } from '@material-ui/core/styles'
import { LoadingSection } from 'components/common/spinners'
import {
	t,
	selectSide,
	selectLocation,
	selectAccountIdentityAddr,
	selectAccountStatsFormatted,
} from 'selectors'

const RRListItem = withReactRouterLink(ListItem)
const { ETH_SCAN_ADDR_HOST } = process.env

const useStyles = makeStyles(styles)

function SideNav(props) {
	const side = useSelector(selectSide)
	const identity = useSelector(selectAccountIdentityAddr)
	const classes = useStyles()
	const routerLocation = useSelector(selectLocation)

	// TODO: test location
	const location = routerLocation.pathname.split('/')[3]
	const isAdvertiser = side === 'advertiser'
	const items = isAdvertiser ? 'units' : 'slots'
	const { availableIdentityBalanceDai } = useSelector(
		selectAccountStatsFormatted
	)

	return side !== 'advertiser' && side !== 'publisher' ? null : (
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
					<div className={classnames(classes.toolbar, classes.sideNavToolbar)}>
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
		</div>
	)
}

export default SideNav
