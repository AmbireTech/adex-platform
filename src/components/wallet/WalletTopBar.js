import React from 'react'
import { useSelector } from 'react-redux'
// import AdexIconTxt from 'components/common/icons/AdexIconTxt'
import ButtonMenu from 'components/common/button_menu/ButtonMenuMui'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
// import ChangeLang from 'components/translate/ChangeLang'
import { getAuthLogo } from 'helpers/logosHelpers'
import { logOut } from 'services/store-data/auth'
import ThemeSwitch from 'components/App/ThemeSwitch'
import {
	AppBar,
	Toolbar,
	Typography,
	Breadcrumbs,
	IconButton,
	ListItemIcon,
	ListItemText,
	Link,
	MenuItem,
	Box,
	Hidden,
	LinearProgress,
} from '@material-ui/core'

import AccountBoxIcon from '@material-ui/icons/AccountBox'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import MenuIcon from '@material-ui/icons/Menu'
import { makeStyles } from '@material-ui/core/styles'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import {
	t,
	selectAccount,
	selectDashboardBreadcrumbs,
	selectInitialDataLoaded,
	selectProject,
} from 'selectors'
import { styles } from 'components/dashboard/dashboard/styles'
import { formatAddress } from 'helpers/formatters'
import { PROJECTS } from 'constants/global'
import clsx from 'clsx'

const RRMenuItem = withReactRouterLink(MenuItem)
const RRLink = withReactRouterLink(Link)

const walletStyles = theme => {
	return {
		appBar: {
			backgroundColor: 'transparent',
			boxShadow: 'none',
		},
		content: {
			'&::before': {
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
				content: '""',
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundImage: `url(${require('resources/wallet/background.jpg')})`,
				opacity: 0.8,
				zIndex: -1,
			},
		},
		jazzIcon: {
			marginLeft: theme.spacing(1),
		},
	}
}

const useStyles = makeStyles(styles)
const useWalletStyles = makeStyles(walletStyles)

function TopNav({ handleDrawerToggle, side }) {
	const classes = useStyles()
	const walletClasses = useWalletStyles()
	const project = useSelector(selectProject)
	const account = useSelector(selectAccount)
	const loaded = useSelector(selectInitialDataLoaded)
	const imgSrc = getAuthLogo(account.wallet.authType)
	const breadcrumbs = useSelector(selectDashboardBreadcrumbs)
	const btnMenuLabel =
		account.wallet.authType === 'demo'
			? t('DEMO_MODE')
			: account.email ||
			  formatAddress(account.wallet.address) ||
			  t('NOT_LOGGED')

	const accountPagePath =
		project === PROJECTS.platform
			? `/dashboard/${side}/account`
			: `/dashboard/account`

	return (
		<AppBar
			className={clsx(classes.appBar, walletClasses.appBar)}
			color='default'
			position='sticky'
		>
			<Box>{!loaded ? <LinearProgress /> : <Box height={4}></Box>}</Box>
			<Toolbar className={classes.toolbar}>
				<Box
					display='flex'
					flexDirection='row'
					flexGrow='1'
					alignItems='center'
					justifyContent='space-between'
				>
					<Box
						display='flex'
						flexDirection='row'
						alignItems='center'
						justifyContent='flex-start'
					>
						<Hidden mdUp>
							<Box px={1}>
								<IconButton
									color='default'
									aria-label='open drawer'
									onClick={handleDrawerToggle}
								>
									<MenuIcon />
								</IconButton>
							</Box>
						</Hidden>

						{/* <Hidden smDown>
						<Box display='flex' flexGrow='1' pl={2}>
							<Breadcrumbs aria-label='breadcrumb'>
								{breadcrumbs.map(({ to, label }, index) =>
									to && index < breadcrumbs.length - 1 ? (
										<RRLink key={`${index}-${to}`} to={to}>
											{label}
										</RRLink>
									) : (
										<Typography
											classes={{ root: classes.breadcrumbElement }}
											noWrap
											component='div'
											key={`${index}-${label}`}
											color='textPrimary'
										>
											{label}
										</Typography>
									)
								)}
							</Breadcrumbs>
						</Box>
					</Hidden> */}

						<Box display='flex' flexDirection='row' alignItems='center' pr={1}>
							{/* <ChangeLang /> */}

							{/* <Jazzicon
								diameter={30}
								seed={jsNumberForAddress(account.wallet.address)}
							/> */}
							<ButtonMenu
								id='menu-appbar'
								// leftIconSrc={imgSrc}
								rightIcon={
									<Box
										ml={1}
										display='flex'
										alignItems='center'
										justifyContent='center'
									>
										<Jazzicon
											className={classes.jazzIcon}
											diameter={30}
											seed={jsNumberForAddress(account.wallet.address)}
										/>
									</Box>
								}
								label={btnMenuLabel}
								variant='contained'
							>
								<RRMenuItem
									value='account'
									to={{ pathname: accountPagePath }}
									caption={t('ACCOUNT')}
								>
									<ListItemIcon>
										<AccountBoxIcon />
									</ListItemIcon>
									<ListItemText
										classes={{ primary: classes.primary }}
										primary={t('ACCOUNT')}
									/>
								</RRMenuItem>
								{/* <MenuDivider /> */}
								<MenuItem
									value='logout'
									onClick={() => {
										logOut()
									}}
								>
									<ListItemIcon>
										<ExitToAppIcon />
									</ListItemIcon>
									<ListItemText
										classes={{ primary: classes.primary }}
										primary={t('LOGOUT')}
									/>
								</MenuItem>
							</ButtonMenu>
						</Box>
					</Box>
					<Box>
						<ThemeSwitch />
					</Box>
				</Box>
			</Toolbar>
		</AppBar>
	)
}

export default TopNav
