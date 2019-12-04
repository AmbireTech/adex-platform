import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import Translate from 'components/translate/Translate'
import { Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { getAuthLogo } from 'helpers/logosHelpers'
import Img from 'components/common/img/Img'
import classnames from 'classnames'
import { getAllWallets } from 'services/wallet/wallet'
import { execute, initIdentity, confirmAction } from 'actions'
import { selectAuth, selectAccount } from 'selectors'
import { logOut } from 'services/store-data/auth'
import { formatAddress } from 'helpers/formatters'
import { push } from 'connected-react-router'
import { t } from 'selectors'

const RRButton = withReactRouterLink(Button)

const AuthSelect = ({ t, classes }) => {
	const [wallets, setWallets] = useState([])
	const [hasLegacyWallets, setHasLegacyWallets] = useState(false)

	const auth = useSelector(selectAuth)
	const account = useSelector(selectAccount)
	const { wallet } = account || {}

	useEffect(() => {
		const allWallets = getAllWallets()
		const wallets = allWallets.filter(
			w => w.authType !== 'legacy' && w.name !== wallet.email
		)
		const hasLegacy = allWallets.length > wallets

		setWallets(wallets)
		setHasLegacyWallets(hasLegacy)
	}, [wallet])

	const goTo = (to, confirmLogout, onConfirm) => {
		const toExecute = () => {
			logOut()
			execute(push(to))
			if (onConfirm && typeof onConfirm === 'function') {
				onConfirm()
			}
		}
		if (auth && confirmLogout) {
			execute(
				confirmAction(toExecute, null, {
					confirmLabel: t('CONTINUE_NEW_AUTH'),
					cancelLabel: t('KEEP_MY_SESSION'),
					title: t('CONFIRM_DIALOG_NEW_AUTH_TITLE'),
					text: t('CONFIRM_DIALOG_NEW_AUTH_TITLE', {
						args: [wallet.authType, wallet.address],
					}),
				})
			)
		} else {
			toExecute()
		}
	}

	return (
		<Box
			display='flex'
			flexDirection='column'
			alignItems='stretch'
			justifyContent='space-between'
		>
			<Box p={2} alignItems='center'>
				<Typography align='center' variant='subtitle1' display='block'>
					{t('SIGN_UP_IN_SELECT')}
				</Typography>
			</Box>
			{auth && (
				<Box m={1}>
					<RRButton
						variant='contained'
						to='/side-select'
						size='large'
						color='default'
						fullWidth
						className={classes.limitedWidthBtn}
					>
						{t('CONTINUE_AS', {
							args: [
								wallet.email || formatAddress(wallet.address),
								wallet.authType,
							],
						})}
					</RRButton>
				</Box>
			)}
			{wallets.map(w => (
				<Box key={w.name} m={1}>
					<Button
						variant='contained'
						size='large'
						color='primary'
						fullWidth
						className={classes.limitedWidthBtn}
						onClick={() => {
							goTo('/login/quick', true, () =>
								execute(initIdentity({ email: w.name, authType: w.authType }))
							)
						}}
					>
						{t('SIGN_IN_TO', { args: [w.name] })}
					</Button>
				</Box>
			))}
			{/* <Box m={1}>
				<Button
					variant='contained'
					to='/identity/grant'
					size='large'
					color='primary'
					fullWidth
					className={classes.limitedWidthBtn}
					onClick={() => goTo('/identity/grant', true)}
				>
					{t('CREATE_GRANT_ACCOUNT')}
				</Button>
			</Box> */}
			{/* {hasLegacyWallets && ( */}
			{/* <Box m={1}>
				<Button
					variant='contained'
					size='large'
					color='secondary'
					fullWidth
					className={classes.limitedWidthBtn}
					onClick={() => goTo('/login/grant', true)}
				>
					{t('LOGIN_GRANT_ACCOUNT')}
				</Button>
			</Box> */}
			{/* )} */}
			<Box m={1}>
				<RRButton
					variant='contained'
					to='/identity/quick'
					size='large'
					color='secondary'
					fullWidth
					className={classes.limitedWidthBtn}
				>
					{t('CREATE_QUICK_ACCOUNT')}
				</RRButton>
			</Box>
			<Box m={1}>
				<Button
					variant='contained'
					size='large'
					color='default'
					fullWidth
					className={classnames(classes.metamaskBtn, classes.limitedWidthBtn)}
					onClick={() => goTo('/login/full?metamask', true)}
				>
					<Img
						src={getAuthLogo('metamask')}
						alt={t('AUTH_WITH_METAMASK')}
						className={classes.btnLogo}
					/>
					{t('METAMASK')}
				</Button>
			</Box>
			<Box m={1}>
				<Button
					variant='contained'
					size='large'
					color='default'
					fullWidth
					className={classes.trezorBtn}
					onClick={() => goTo('/login/full?trezor', true)}
				>
					<Img
						src={getAuthLogo('trezor')}
						alt={t('AUTH_WITH_TREZOR')}
						className={classnames(
							classes.btnLogo,
							classes.btnLogoNoTxt,
							classes.limitedWidthBtn
						)}
					/>
					{/* {t('TREZOR')} */}
				</Button>
			</Box>
			<Box m={1}>
				<RRButton
					variant='link'
					to='/recover/quick'
					size='large'
					color='secondary'
					className={classes.limitedWidthBtn}
					fullWidth
				>
					{t('RECOVER_QUICK_ACCOUNT')}
				</RRButton>
			</Box>
		</Box>
	)
}

export default Translate(withStyles(styles)(AuthSelect))
