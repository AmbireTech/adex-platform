import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
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

const RRButton = withReactRouterLink(Button)

const AuthSelect = ({ t, classes }) => {
	const [wallets, setWallets] = useState([])
	const [hasLegacyWallets, setHasLegacyWallets] = useState(false)

	const auth = useSelector(selectAuth)
	const account = useSelector(selectAccount)
	const { wallet } = account || {}

	useEffect(() => {
		const allWallets = getAllWallets()
		const wallets = allWallets.filter(w => w.authType !== 'legacy')
		const hasLegacy = allWallets.length > wallets

		setWallets(wallets)
		setHasLegacyWallets(hasLegacy)
	}, [])

	return (
		<Grid
			container
			spacing={2}
			direction='column'
			alignItems='stretch'
			wrap='nowrap'
		>
			{auth && (
				<Grid item xs={12}>
					<RRButton
						variant='contained'
						to='/side-select'
						size='large'
						color='default'
						fullWidth
					>
						{t('CONTINUE_AS', {
							args: [wallet.email || wallet.address, wallet.authType],
						})}
					</RRButton>
				</Grid>
			)}
			{wallets.map(w => (
				<Grid key={w.name} item xs={12}>
					<RRButton
						variant='contained'
						to={`/login/quick`}
						size='large'
						color='primary'
						fullWidth
						onClick={() =>
							execute(initIdentity({ email: w.name, authType: w.authType }))
						}
					>
						{t('SIGN_IN_TO', { args: [w.name] })}
					</RRButton>
				</Grid>
			))}
			<Grid item xs={12}>
				<RRButton
					variant='contained'
					to='/identity/grant'
					size='large'
					color='primary'
					fullWidth
					onClick={logOut}
				>
					{t('CREATE_GRANT_ACCOUNT')}
				</RRButton>
			</Grid>
			{hasLegacyWallets && (
				<Grid item xs={12}>
					<RRButton
						variant='contained'
						to='/login/grant'
						size='large'
						color='secondary'
						fullWidth
						onClick={logOut}
					>
						{t('LOGIN_GRANT_ACCOUNT')}
					</RRButton>
				</Grid>
			)}
			<Grid item xs={12}>
				<RRButton
					variant='contained'
					to='/identity/quick'
					size='large'
					color='secondary'
					fullWidth
				>
					{t('CREATE_QUICK_ACCOUNT')}
				</RRButton>
			</Grid>
			<Grid item xs={12}>
				<RRButton
					variant='contained'
					to='/login/full?metamask'
					size='large'
					color='default'
					fullWidth
					className={classes.metamaskBtn}
					onClick={logOut}
				>
					<Img
						src={getAuthLogo('metamask')}
						alt={t('AUTH_WITH_METAMASK')}
						className={classes.btnLogo}
					/>
					{t('METAMASK')}
				</RRButton>
			</Grid>
			<Grid item xs={12}>
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
						className={classnames(classes.btnLogo, classes.btnLogoNoTxt)}
					/>
					{/* {t('TREZOR')} */}
				</RRButton>
			</Grid>
			<Grid item xs={12}>
				<RRButton
					variant='link'
					to='/recover/quick'
					size='large'
					color='secondary'
					fullWidth
				>
					{t('RECOVER_QUICK_ACCOUNT')}
				</RRButton>
			</Grid>
		</Grid>
	)
}

export default Translate(withStyles(styles)(AuthSelect))
