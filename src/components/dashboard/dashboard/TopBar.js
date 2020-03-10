import React from 'react'
import { useSelector } from 'react-redux'
// import AdexIconTxt from 'components/common/icons/AdexIconTxt'
import ButtonMenu from 'components/common/button_menu/ButtonMenuMui'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import Translate from 'components/translate/Translate'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
// import ChangeLang from 'components/translate/ChangeLang'
import { getAuthLogo } from 'helpers/logosHelpers'
import { logOut } from 'services/store-data/auth'

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
} from '@material-ui/core'

import classnames from 'classnames'
import AccountBoxIcon from '@material-ui/icons/AccountBox'
import ExitToAppIcon from '@material-ui/icons/ExitToApp'
import MenuIcon from '@material-ui/icons/Menu'
import { makeStyles } from '@material-ui/core/styles'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { selectAccount, selectDashboardBreadcrumbs } from 'selectors'
import { styles } from './styles'
import { formatAddress } from 'helpers/formatters'

const RRMenuItem = withReactRouterLink(MenuItem)
const RRLink = withReactRouterLink(Link)
const useStyles = makeStyles(styles)

function TopNav({ handleDrawerToggle, side, t }) {
	const classes = useStyles()
	const account = useSelector(selectAccount)
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
				<div className={classes.flexRow}>
					<IconButton
						color='inherit'
						aria-label='open drawer'
						onClick={handleDrawerToggle}
						className={classnames(classes.navIconHide)}
					>
						<MenuIcon />
					</IconButton>

					{/* <AdexIconTxt
              className={classes.icon}
            /> */}
					<div className={classnames(classes.flex, classes.toolbarControls)}>
						{/* <Navigation type='horizontal' className={theme.rightNavigation}> */}
						{/* At the moment we use translations only for proper items properties display names */}
						{/* <ChangeLang /> */}
						<Jazzicon
							diameter={30}
							seed={jsNumberForAddress(account.wallet.address)}
						/>
						<ButtonMenu
							id='menu-appbar'
							leftIconSrc={imgSrc}
							rightIcon={<ExpandMoreIcon />}
							label={btnMenuLabel}
							active={true}
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
					</div>
				</div>
				<div className={classes.flexRow}>
					<div className={classnames(classes.flex, classes.toolbarTitle)}>
						<Breadcrumbs aria-label='breadcrumb'>
							{breadcrumbs.map(({ to, label }, index) =>
								index !== breadcrumbs.length - 1 ? (
									<RRLink to={to}>{label}</RRLink>
								) : (
									<Typography color='textPrimary'>{label}</Typography>
								)
							)}
						</Breadcrumbs>
					</div>
				</div>
			</Toolbar>
		</AppBar>
	)
}

export default Translate(TopNav)
