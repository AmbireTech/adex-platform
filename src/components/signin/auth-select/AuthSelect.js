import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Button from '@material-ui/core/Button'
import { Box, Divider } from '@material-ui/core'
import { Close } from '@material-ui/icons'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { getAuthLogo } from 'helpers/logosHelpers'
import Img from 'components/common/img/Img'
import classnames from 'classnames'
import { getAllWallets } from 'services/wallet/wallet'
import { execute, initIdentity, confirmAction } from 'actions'
import { selectAuth, selectAccount, selectRegistrationAllowed } from 'selectors'
import { logOut } from 'services/store-data/auth'
import { formatAddress } from 'helpers/formatters'
import { push } from 'connected-react-router'
import { t } from 'selectors'
import { removeFromLocalStorage } from 'helpers/localStorageHelpers'

const RRButton = withReactRouterLink(Button)
const useStyles = makeStyles(styles)

const AuthSelect = () => {
	const classes = useStyles()
	const [wallets, setWallets] = useState([])

	const showRegistration = useSelector(selectRegistrationAllowed)
	const auth = useSelector(selectAuth)
	const account = useSelector(selectAccount)
	const { wallet, identity } = account || {}

	useEffect(() => {
		const allWallets = getAllWallets()
		const wallets = allWallets.filter(
			w => w.authType !== 'legacy' && w.name !== wallet.email
		)
		setWallets(wallets)
	}, [wallet])

	const goTo = (to, confirmLogout, onConfirm) => {
		const toExecute = () => {
			// skip redirect as you are going to be redirected on next line
			// this resolves an issue of "Same web property ID is tracked twice."
			// with the google analytics pixel
			logOut(true)
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
					text: t('CONFIRM_DIALOG_NEW_AUTH_TEXT', {
						args: [
							(wallet.email || (wallet.authType || '')).toUpperCase(),
							identity.address,
						],
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
								wallet.email || formatAddress(identity.address),
								wallet.authType,
							],
						})}
					</RRButton>
				</Box>
			)}
			{wallets.map(w => (
				<Box key={w.name} m={1} display='flex'>
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
					<Button
						variant='contained'
						size='large'
						onClick={() => {
							execute(
								confirmAction(
									() => {
										removeFromLocalStorage(w.key)
										setWallets(wallets.filter(i => i.key !== w.key))
									},
									null,
									{
										confirmLabel: t('CONFIRM_YES'),
										cancelLabel: t('CANCEL'),
										title: t('CONFIRM_DIALOG_REMOVE_SAVED_AUTH_TITLE'),
										text: t('CONFIRM_DIALOG_REMOVE_SAVED_AUTH_TEXT', {
											args: [
												(wallet.email || (wallet.authType || '')).toUpperCase(),
												identity.address,
											],
										}),
									}
								)
							)
						}}
					>
						<Close />
					</Button>
				</Box>
			))}
			{(wallets.length > 0 || auth) && <Divider />}
			{showRegistration && (
				<Box m={1}>
					<Button
						variant='contained'
						size='large'
						color='secondary'
						fullWidth
						className={classes.limitedWidthBtn}
						onClick={() => {
							goTo('/signup/quick', true)
						}}
					>
						{t('CREATE_QUICK_ACCOUNT')}
					</Button>
				</Box>
			)}
			<Box m={1}>
				<Button
					variant='contained'
					size='large'
					color='primary'
					fullWidth
					className={classes.limitedWidthBtn}
					onClick={() => goTo('/login/quick', true)}
				>
					{t('LOGIN_QUICK_ACCOUNT')}
				</Button>
			</Box>

			<Box m={1}>
				<Button
					variant='outlined'
					size='large'
					color='default'
					fullWidth
					className={classnames(classes.metamaskBtn, classes.limitedWidthBtn)}
					onClick={() => goTo('/login/full?external=metamask', true)}
				>
					<img
						src={getAuthLogo('metamask')}
						alt={t('AUTH_WITH_METAMASK')}
						className={classes.btnLogo}
					/>
					{t('METAMASK')}
				</Button>
			</Box>
			<Box m={1}>
				<Button
					variant='outlined'
					size='large'
					color='default'
					fullWidth
					className={classes.trezorBtn}
					onClick={() => goTo('/login/full?external=trezor', true)}
				>
					<img
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
		</Box>
	)
}

export default AuthSelect
