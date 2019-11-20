import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { getAuthLogo } from 'helpers/logosHelpers'
import Img from 'components/common/img/Img'
import classnames from 'classnames'
import { getAllWallets } from 'services/wallet/wallet'
import { execute, initIdentity } from 'actions'
import { selectAuth, selectAccount } from 'selectors'
import { logOut } from 'services/store-data/auth'
import { formatAddress } from 'helpers/formatters'

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

	return (
		<Box
			display='flex'
			flexDirection='column'
			alignItems='stretch'
			justifyContent='space-between'
		>
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
					<RRButton
						variant='contained'
						to={`/login/quick`}
						size='large'
						color='primary'
						fullWidth
						className={classes.limitedWidthBtn}
						onClick={() =>
							execute(initIdentity({ email: w.name, authType: w.authType }))
						}
					>
						{t('SIGN_IN_TO', { args: [w.name] })}
					</RRButton>
				</Box>
			))}
			<Box m={1}>
				<RRButton
					variant='contained'
					to='/identity/grant'
					size='large'
					color='primary'
					fullWidth
					className={classes.limitedWidthBtn}
					onClick={logOut}
				>
					{t('CREATE_GRANT_ACCOUNT')}
				</RRButton>
			</Box>
			{/* {hasLegacyWallets && ( */}
			<Box m={1}>
				<RRButton
					variant='contained'
					to='/login/grant'
					size='large'
					color='secondary'
					fullWidth
					className={classes.limitedWidthBtn}
					onClick={logOut}
				>
					{t('LOGIN_GRANT_ACCOUNT')}
				</RRButton>
			</Box>
			{/* )} */}
			{/* <Box m={1}>
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
			</Box> */}
			<Box m={1}>
				<RRButton
					variant='contained'
					to='/login/full?metamask'
					size='large'
					color='default'
					fullWidth
					className={classnames(classes.metamaskBtn, classes.limitedWidthBtn)}
					onClick={logOut}
				>
					<Img
						src={getAuthLogo('metamask')}
						alt={t('AUTH_WITH_METAMASK')}
						className={classes.btnLogo}
					/>
					{t('METAMASK')}
				</RRButton>
			</Box>
			<Box m={1}>
				<RRButton
					variant='contained'
					to='/login/full?trezor'
					size='large'
					color='default'
					fullWidth
					className={classes.trezorBtn}
					onClick={logOut}
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
				</RRButton>
			</Box>
			{/* <Box m={1}>
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
			</Box> */}
		</Box>
	)
}

export default Translate(withStyles(styles)(AuthSelect))
