import React from 'react'
import { useSelector } from 'react-redux'
import ButtonMenu from 'components/common/button_menu/ButtonMenuMui'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import Translate from 'components/translate/Translate'
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
	selectAccount,
	selectDashboardBreadcrumbs,
	selectInitialDataLoaded,
} from 'selectors'
import { styles } from './styles'
import { formatAddress } from 'helpers/formatters'

const RRMenuItem = withReactRouterLink(MenuItem)
const RRLink = withReactRouterLink(Link)
const useStyles = makeStyles(styles)

function TopNav({ handleDrawerToggle, side, t }) {
	const classes = useStyles()
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

	return (
		<AppBar className={classes.appBar} color='default' position='sticky'>
			<Toolbar className={classes.toolbar}>
				<Box
					display='flex'
					flexDirection='row'
					flexGrow='1'
					alignItems='center'
					justifyContent='space-between'
				>
					<Hidden mdUp>
						<Box pl={1}>
							<IconButton
								color='default'
								aria-label='open drawer'
								onClick={handleDrawerToggle}
							>
								<MenuIcon />
							</IconButton>
						</Box>
					</Hidden>

					<Hidden smDown>
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
					</Hidden>

					<Box display='flex' flexDirection='row' alignItems='center' pr={1}>
						{/* <ChangeLang /> */}
						<ThemeSwitch />
						<Jazzicon
							diameter={30}
							seed={jsNumberForAddress(account.wallet.address)}
						/>
						<ButtonMenu
							id='menu-appbar'
							leftIconSrc={imgSrc}
							rightIcon={<ExpandMoreIcon />}
							label={btnMenuLabel}
						>
							<RRMenuItem
								value='account'
								to={{ pathname: '/dashboard/' + side + '/account' }}
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
			</Toolbar>
			<Box>{!loaded && <LinearProgress />}</Box>
		</AppBar>
	)
}

export default Translate(TopNav)
