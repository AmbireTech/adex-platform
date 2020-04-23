import React from 'react'
import { useSelector } from 'react-redux'
import Anchor from 'components/common/anchor/anchor'
import Img from 'components/common/img/Img'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { AddressSelect } from './AuthCommon'
import {
	ContentBox,
	ContentBody,
	ContentStickyTop,
	TopLoading,
} from 'components/common/dialog/content'
import { makeStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import TREZOR_DL_IMG from 'resources/trezor-logo-h.png'
import {
	AUTH_WAITING_ADDRESS_DATA,
	AUTH_WAITING_TREZOR_ACTION,
} from 'constants/spinners'
import { AUTH_TYPES } from 'constants/misc'
import { t, selectIdentity, selectSpinnerById } from 'selectors'
import { connectTrezor, execute } from 'actions'

const useStyles = makeStyles(styles)

function AuthTrezor() {
	const classes = useStyles()
	const { wallet = {}, addresses = [], hdWalletAddrPath } = useSelector(
		selectIdentity
	)
	const { address } = wallet

	const waitingTrezorAction = useSelector(state =>
		selectSpinnerById(state, AUTH_WAITING_TREZOR_ACTION)
	)

	const waitingAddrsData = useSelector(state =>
		selectSpinnerById(state, AUTH_WAITING_ADDRESS_DATA)
	)

	return addresses.length ? (
		<AddressSelect
			waitingAction={waitingTrezorAction}
			actionWaitingLabel={t('TREZOR_WAITING_ACTION')}
			selectLabel={t('SELECT_ADDR_TREZOR')}
			address={address}
			addresses={addresses}
			signType={AUTH_TYPES.TREZOR.signType}
			authType={AUTH_TYPES.TREZOR.name}
			hdWalletAddrPath={hdWalletAddrPath}
			classes={classes}
		/>
	) : (
		<ContentBox className={classes.tabBox}>
			{waitingAddrsData ? (
				<ContentStickyTop>
					<TopLoading msg={t('TREZOR_WAITING_ADDRS_INFO')} />
				</ContentStickyTop>
			) : waitingTrezorAction ? (
				<ContentStickyTop>
					<TopLoading msg={t('TREZOR_WAITING_ACTION')} />
				</ContentStickyTop>
			) : null}

			<ContentBody>
				<Box
					display='flex'
					flexDirection='column'
					alignItems='center'
					justifyContent='center'
					width={1}
				>
					<Typography variant='subtitle1' gutterBottom>
						{t('TREZOR_INFO')}
					</Typography>

					<Typography gutterBottom>
						{t('TREZOR_BASIC_USAGE_INFO', {
							args: [
								<Anchor
									key='trezor-wallet'
									href='https://trezor.io/'
									target='_blank'
								>
									TREZOR Wallet
								</Anchor>,
								<Anchor
									key='trezor-bridge'
									href='https://wallet.trezor.io/#/bridge'
									target='_blank'
								>
									TREZOR Bridge
								</Anchor>,
							],
						})}
					</Typography>
					<Box mb={2}>
						<Anchor href='https://trezor.io' target='_blank'>
							<Img
								src={TREZOR_DL_IMG}
								alt={'https://trezor.io'}
								className={classes.dlBtnImg}
							/>
						</Anchor>
					</Box>
					{!waitingAddrsData && !waitingTrezorAction && (
						<Button
							onClick={() => execute(connectTrezor())}
							variant='contained'
							color='primary'
						>
							{t('CONNECT_WITH_TREZOR')}
						</Button>
					)}
				</Box>
			</ContentBody>
		</ContentBox>
	)
}

export default AuthTrezor
