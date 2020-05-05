import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListDivider from '@material-ui/core/Divider'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import CampaignIcon from 'components/common/icons/CampaignIcon'
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn'
import classnames from 'classnames'
import packageJson from './../../../../package.json'
import Anchor from 'components/common/anchor/anchor'
import { styles } from './styles'
import SideSwitch from './SideSwitch'
import AdexIconTxt from 'components/common/icons/AdexIconTxt'
import DashboardIcon from '@material-ui/icons/Dashboard'
import SwapHorizontalIcon from '@material-ui/icons/SwapHoriz'
import { ChevronRight } from '@material-ui/icons'
import { Receipt } from '@material-ui/icons'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import AccountBoxIcon from '@material-ui/icons/AccountBox'
import Box from '@material-ui/core/Box'
import ListIcon from '@material-ui/icons/List'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import { LoadingSection } from 'components/common/spinners'
import {
	t,
	selectSide,
	selectLocation,
	selectAccountIdentityAddr,
	selectAccountStatsFormatted,
	selectMainToken,
	selectDashboardBreadcrumbs,
} from 'selectors'

const RRListItem = withReactRouterLink(ListItem)
const { ETH_SCAN_ADDR_HOST } = process.env

const useStyles = makeStyles(theme => {
	const activeColor = ({ side }) =>
		side === 'advertiser'
			? theme.palette.primary.contrastText
			: theme.palette.primary.contrastText

	const activeBgColor = ({ side }) =>
		side === 'advertiser'
			? theme.palette.primary.main
			: theme.palette.primary.main

	return {
		navigation: {
			backgroundColor: theme.palette.background.paper,
		},
		sntPadding: {
			paddingTop: 0,
		},
		navListRoot: {
			color: theme.palette.text.secondary,
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
		},
		navList: {
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			bottom: 100,
			overflowY: 'auto',
			overflowX: 'hidden',
		},
		sideNavToolbar: {},
		version: {
			position: 'absolute',
			bottom: 0,
			left: 0,
			right: 0,
			padding: 10,
			paddingLeft: 16,
			borderTopWidth: 1,
			borderTopColor: theme.palette.divider,
			borderTopStyle: 'solid',
		},
		active: {
			color: activeColor,
			backgroundColor: activeBgColor,
			'&:focus': {
				backgroundColor: activeBgColor,
			},
			'&:hover': {
				backgroundColor: activeBgColor,
				color: activeColor,
				'& .MuiListItemIcon-root': {
					color: activeColor,
				},
			},
			'& .MuiListItemIcon-root': {
				color: theme.palette.common.white,
			},
		},
		adxLink: {
			color: theme.palette.text.hint,
			'&:hover': {
				color: theme.palette.text.secondary,
			},
		},
		sideSwitch: {
			marginBottom: `${theme.spacing(2)}px`,
		},
		icon: {
			height: 32,
			width: 'auto',
		},
		amount: {
			fontSize: theme.typography.pxToRem(18),
		},
	}
})

const useCommonStyles = makeStyles(styles)

function SideNav(props) {
	const side = useSelector(selectSide)
	const identity = useSelector(selectAccountIdentityAddr)
	const classes = useStyles({ side })
	const commonClasses = useCommonStyles()
	const routerLocation = useSelector(selectLocation)
	const breadcrumbs = useSelector(selectDashboardBreadcrumbs)
	const { symbol } = useSelector(selectMainToken)

	// TODO: test location
	const location = routerLocation.pathname.split('/')[3]
	const isAdvertiser = side === 'advertiser'
	const items = isAdvertiser ? 'units' : 'slots'
	const { availableIdentityBalanceMainToken } = useSelector(
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
					<Box
						bgcolor='background.paper'
						className={classnames(
							// commonClasses.toolbar,
							classes.sideNavToolbar
						)}
						// mb={6}
					>
						<ListItem>
							<AdexIconTxt className={classes.icon} />
						</ListItem>
						<ListItem>
							<LoadingSection
								loading={
									!availableIdentityBalanceMainToken &&
									availableIdentityBalanceMainToken !== 0
								}
							>
								<Typography
									variant='button'
									display='block'
									component='div'
									color='textPrimary'
									classes={{ button: classes.amount }}
								>
									<strong>{`${availableIdentityBalanceMainToken ||
										0} ${symbol}`}</strong>
								</Typography>
								<Typography variant='button' component='div' display='block'>
									{t('IDENTITY_BALANCE')}
								</Typography>
							</LoadingSection>
						</ListItem>
					</Box>
					<SideSwitch className={classes.sideSwitch} side={side} t={t} />
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
					<RRListItem
						button
						to={{ pathname: '/dashboard/' + side + '/' + items }}
						className={classnames({
							[classes.active]: location === items && breadcrumbs.length === 2,
						})}
					>
						<ListItemIcon>
							<ListIcon />
						</ListItemIcon>
						<ListItemText primary={t(items.toUpperCase())} />
					</RRListItem>
					{breadcrumbs.length === 3 && (
						<Fragment>
							<ListDivider />
							<ListItem
								className={classnames({
									[classes.active]: true,
								})}
							>
								<ListItemIcon>
									<ChevronRight />
								</ListItemIcon>
								<ListItemText primary={breadcrumbs[2].label} />
							</ListItem>
						</Fragment>
					)}

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
					{side === 'publisher' && (
						<>
							<RRListItem
								button
								to={{ pathname: '/dashboard/publisher/receipts' }}
								className={classnames({
									[classes.active]: location === 'receipts',
								})}
							>
								<ListItemIcon>
									<Receipt />
								</ListItemIcon>
								<ListItemText primary={t('RECEIPTS')} />
							</RRListItem>
							<ListDivider />
						</>
					)}
				</div>
				<div>
					<ListDivider />
					<RRListItem
						button
						to={{ pathname: '/dashboard/' + side + '/topup' }}
						className={classnames({
							[classes.active]: location === 'topup',
						})}
					>
						<ListItemIcon>
							<MonetizationOnIcon color='secondary' />
						</ListItemIcon>
						<ListItemText primary={t('TOP_UP')} />
					</RRListItem>
					<ListDivider />
					<Anchor target='_blank' href={`${process.env.ADEX_HELP_URL}`}>
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
				<div className={classes.adxLink}>
					<small>
						<Anchor
							className={classes.adxLink}
							target='_blank'
							href={`${process.env.ADEX_SITE_HOST}/tos`}
						>
							{t('TOS_CHECK')}
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
							href='https://github.com/AdExNetwork/adex-platform/blob/development/CHANGELOG.md.'
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
