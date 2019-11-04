import React from 'react'
import { useSelector } from 'react-redux'
// import AdexIconTxt from 'components/common/icons/AdexIconTxt'
import ButtonMenu from 'components/common/button_menu/ButtonMenuMui'
import Translate from 'components/translate/Translate'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
// import ChangeLang from 'components/translate/ChangeLang'
import { getAuthLogo } from 'helpers/logosHelpers'
import { logOut } from 'services/store-data/auth'

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import classnames from 'classnames'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'

import { makeStyles } from '@material-ui/core/styles'
import MenuItem from '@material-ui/core/MenuItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { selectNavTitle, selectAccount } from 'selectors'
import { styles } from './styles'

const getAddrLabel = (address = '') => {
	return `${address.substring(0, 8)}...${address.substring(36, 42)}`
}

const RRMenuItem = withReactRouterLink(MenuItem)
const useStyles = makeStyles(styles)

function TopNav({ handleDrawerToggle, side, t }) {
	const classes = useStyles()
	const navTitle = useSelector(selectNavTitle)
	const account = useSelector(selectAccount)
	const imgSrc = getAuthLogo(account.wallet.authType)
	const btnMenueLabel =
		account.wallet.authType === 'demo'
			? t('DEMO_MODE')
			: account.email || getAddrLabel(account.wallet.address) || t('NOT_LOGGED')

	return (
		<AppBar className={classes.appBar} position='sticky'>
			<Toolbar className={classes.toolbar}>
				<div className={classes.flexRow}>
					<IconButton
						color='inherit'
						aria-label='open drawer'
						onClick={handleDrawerToggle}
						className={classnames(classes.navIconHide)}
					>
						<Icon>menu</Icon>
					</IconButton>

					{/* <AdexIconTxt
              className={classes.icon}
            /> */}
					<div className={classnames(classes.flex, classes.toolbarControls)}>
						{/* <Navigation type='horizontal' className={theme.rightNavigation}> */}
						{/* At the moment we use translations only for proper items properties display names */}
						{/* <ChangeLang /> */}
						<ButtonMenu
							leftIconSrc={imgSrc}
							icon={<ExpandMoreIcon />}
							label={btnMenueLabel}
							active={true}
							iconStyle={{ marginTop: -2, marginLeft: 10, fontSize: 20 }}
						>
							<RRMenuItem
								value='account'
								to={{ pathname: '/dashboard/' + side + '/account' }}
								caption={t('ACCOUNT')}
							>
								<ListItemIcon>
									<Icon>account_box</Icon>
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
									<Icon>exit_to_app</Icon>
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
						<Typography
							variant='subtitle1'
							color='inherit'
							className={classes.flex}
							noWrap
						>
							{t(navTitle)}
						</Typography>
					</div>
				</div>
			</Toolbar>
		</AppBar>
	)
}

export default Translate(TopNav)
