import React from 'react'
import { useSelector } from 'react-redux'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ListDivider from '@material-ui/core/Divider'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import MonetizationOnIcon from '@material-ui/icons/MonetizationOn'
import classnames from 'classnames'
import packageJson from './../../../package.json'
import Anchor from 'components/common/anchor/anchor'
import AdexIconTxt from 'components/common/icons/AdexIconTxt'
import AdexIconTxtDark from 'components/common/icons/AdexIconTxtDark'
import DashboardIcon from '@material-ui/icons/Dashboard'
import SwapHorizontalIcon from '@material-ui/icons/SwapHoriz'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import AccountBoxIcon from '@material-ui/icons/AccountBox'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { LoadingSection } from 'components/common/spinners'
import { AmountText } from 'components/common/amount'
import {
	t,
	selectLocation,
	selectAccountIdentityAddr,
	selectAccountStatsFormatted,
	selectInitialDataLoaded,
} from 'selectors'

const RRListItem = withReactRouterLink(ListItem)
const RRAdexIconTxt = withReactRouterLink(AdexIconTxt)
const RRAdexIconTxtDark = withReactRouterLink(AdexIconTxtDark)
const { ETH_SCAN_ADDR_HOST } = process.env

const useStyles = makeStyles(theme => {
	const activeColor = theme.palette.primary.contrastText

	const activeBgColor = theme.palette.primary.main

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
			cursor: 'pointer',
		},
		amount: {
			fontSize: theme.typography.pxToRem(18),
		},
	}
})

function SideNav(props) {
	const theme = useTheme()
	const identity = useSelector(selectAccountIdentityAddr)
	const classes = useStyles()
	const routerLocation = useSelector(selectLocation)
	// const { symbol } = useSelector(selectMainToken)

	// TODO: test location
	const location = routerLocation.pathname.split('/')[2]
	const loaded = useSelector(selectInitialDataLoaded)
	const { totalMainCurrenciesValues } = useSelector(selectAccountStatsFormatted)

	const AdxIcon = theme.type === 'dark' ? RRAdexIconTxtDark : RRAdexIconTxt

	return (
		<Box
			display='flex'
			flexDirection='column'
			justifyContent='space-between'
			flexGrow='1'
		>
			<Box>
				<Box>
					<ListItem>
						<Box>
							<AdxIcon
								// @cryptofan
								to={{ pathname: '/dashboard/' }}
								className={classes.icon}
							/>
							<LoadingSection loading={!loaded}>
								<AmountText
									text={`$ ${totalMainCurrenciesValues['USD'].toFixed(2) || 0}`}
									fontSize={25}
								/>
								<Typography variant='button' component='div' display='block'>
									{t('IDENTITY_BALANCE')}
								</Typography>
							</LoadingSection>
						</Box>
					</ListItem>
				</Box>
			</Box>

			<Box
				display='flex'
				flexDirection='column'
				justifyContent='space-between'
				flex='1'
			>
				<Box>
					<List>
						<ListDivider />
						<RRListItem
							button
							to={{ pathname: '/dashboard/' }}
							className={classnames({ [classes.active]: !location })}
						>
							<ListItemIcon>
								<DashboardIcon />
							</ListItemIcon>
							<ListItemText primary={t('DASHBOARD')} />
						</RRListItem>
						<ListDivider />
					</List>
				</Box>
				<Box>
					<List>
						<ListDivider />
						<RRListItem
							button
							to={{ pathname: '/dashboard/topup' }}
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
						<Anchor
							fullWidth
							target='_blank'
							href={`${process.env.ADEX_HELP_URL}`}
						>
							<ListItem button>
								<ListItemIcon>
									<HelpOutlineIcon />
								</ListItemIcon>
								<ListItemText primary={t('HELP')} />
							</ListItem>
						</Anchor>

						<Anchor
							fullWidth
							target='_blank'
							href={`${ETH_SCAN_ADDR_HOST + identity}`}
						>
							<ListItem button>
								<ListItemIcon>
									<SwapHorizontalIcon />
								</ListItemIcon>
								<ListItemText primary={t('TRANSACTIONS')} />
							</ListItem>
						</Anchor>

						<RRListItem
							button
							to={{ pathname: '/dashboard/account' }}
							className={classnames({
								[classes.active]: location === 'account',
							})}
						>
							<ListItemIcon>
								<AccountBoxIcon />
							</ListItemIcon>
							<ListItemText primary={t('ACCOUNT')} />
						</RRListItem>
					</List>
				</Box>
			</Box>

			<Box>
				<ListDivider />
				<ListItem>
					<Box>
						<div>
							<small>
								{' '}
								&copy; {new Date().getFullYear()} &nbsp;
								<Anchor target='_blank' href={process.env.ADEX_SITE_HOST}>
									AdEx Network OÜ
								</Anchor>
							</small>
						</div>
						<div>
							<small>
								<Anchor
									target='_blank'
									href={`${process.env.ADEX_SITE_HOST}/tos`}
								>
									{t('TOS')}
								</Anchor>
							</small>
						</div>
						<div>
							<small>
								<Anchor
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
									target='_blank'
									href='https://github.com/AdExNetwork/adex-platform/blob/development/CHANGELOG.md'
								>
									v.{packageJson.version}-beta
								</Anchor>
							</small>
						</div>
					</Box>
				</ListItem>
			</Box>
		</Box>
	)
}

export default SideNav
