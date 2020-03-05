import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import METAMASK_DL_IMG from 'resources/download-metamask.png'
import METAMASK_IMG from 'resources/metamask.png'
import Anchor from 'components/common/anchor/anchor'
import Img from 'components/common/img/Img'
import { AUTH_TYPES } from 'constants/misc'
import { AddrItem } from './AuthCommon'
import {
	ContentBox,
	ContentBody,
	ContentStickyTop,
	TopLoading,
} from 'components/common/dialog/content'
import Helper from 'helpers/miscHelpers'
import { makeStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { getEthers, getEthereumProvider } from 'services/smart-contracts/ethers'
import { getSigner } from 'services/smart-contracts/actions/ethers'
import { getAddressBalances } from 'services/smart-contracts/actions/stats'
import Box from '@material-ui/core/Box'
import {
	addToast,
	updateIdentity,
	updateIdentityWallet,
	execute,
} from 'actions'
import { t, selectIdentity } from 'selectors'

const useStyles = makeStyles(styles)

function AuthMetamask(props) {
	const classes = useStyles()
	const { wallet = {}, stats } = useSelector(selectIdentity)
	const { address } = wallet
	const [installingMetamask, setInstallingMetamask] = useState(false)
	// const [stats, setStats] = useState(null)
	const [waitingMetamaskAction, setWaitingMetamaskAction] = useState(false)
	const [waitingAddrsData, setWaitingAddrsData] = useState(false)
	const isOpera =
		!!window.opr || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0
	const [isMetamaskEthereumProvider, setIsMetamaskEthereumProvider] = useState(
		false
	)

	useEffect(() => {
		const setEth = async () => {
			const ethereumProvider = await getEthereumProvider()
			setIsMetamaskEthereumProvider(
				ethereumProvider === AUTH_TYPES.METAMASK.name
			)
		}

		setEth()
	}, [])

	useEffect(() => {
		if (installingMetamask) {
			// Refreshes page after user comes back
			// from installing Metamask
			window.onfocus = () => {
				window.location.reload()
				setInstallingMetamask(false)
			}
		}
	}, [installingMetamask])

	const checkMetamask = async () => {
		setWaitingAddrsData(true)
		try {
			const authType = AUTH_TYPES.METAMASK.name
			const { provider } = await getEthers(authType)
			const wallet = {
				authType: authType,
			}

			const metamaskSigner = await getSigner({ wallet, provider })
			const address = await metamaskSigner.getAddress()
			const stats = await getAddressBalances({
				address: { address },
				authType,
				getFullBalances: true,
			})

			execute(updateIdentity('stats', stats))
			setWaitingAddrsData(false)

			execute(
				updateIdentityWallet({
					address,
					authType: AUTH_TYPES.METAMASK.name,
					signType: AUTH_TYPES.METAMASK.signType,
				})
			)
		} catch (err) {
			console.error('Error: catch', err)
			setWaitingMetamaskAction(false)
			setWaitingAddrsData(false)
			execute(
				addToast({
					type: 'cancel',
					label: t('ERR_AUTH_METAMASK', {
						args: [Helper.getErrMsg(err)],
					}),
					timeout: 5000,
				})
			)
		}
	}

	return (
		<ContentBox className={classes.tabBox}>
			{waitingMetamaskAction ? (
				<ContentStickyTop>
					<TopLoading msg={t('METAMASK_WAITING_ACTION')} />
				</ContentStickyTop>
			) : waitingAddrsData ? (
				<TopLoading msg={t('METAMASK_WAITING_ADDR_INFO')} />
			) : null}
			<ContentBody>
				<Typography variant='subtitle1'>{t('METAMASK_INFO')}</Typography>
				<Box
					display='flex'
					flexDirection='column'
					alignItems='center'
					justifyContent='center'
					width={1}
				>
					{!isMetamaskEthereumProvider ? (
						<Box mb={2}>
							<Box>
								<Typography>
									{t('METAMASK_BASIC_USAGE_INFO', {
										args: [
											<Anchor
												key={'metamask-anchor'}
												href={
													isOpera
														? 'https://chrome.google.com/webstore/detail/nkbihfbeogaeaoehlefnkodbefgpgknn'
														: 'https://metamask.io/'
												}
												target='_blank'
											>
												https://metamask.io/
											</Anchor>,
										],
									})}
								</Typography>
							</Box>
							<Box mt={1}>
								<Anchor
									href={
										isOpera
											? 'https://chrome.google.com/webstore/detail/nkbihfbeogaeaoehlefnkodbefgpgknn'
											: 'https://metamask.io/'
									}
									target='_blank'
									onClick={() => setInstallingMetamask(true)}
								>
									<Img
										src={METAMASK_DL_IMG}
										alt={'Downlad metamask'}
										className={classes.dlBtnImg}
									/>
								</Anchor>
							</Box>
						</Box>
					) : (
						<Box mb={2}>
							<Img
								src={METAMASK_IMG}
								alt={'metamask logo'}
								className={classes.dlBtnImg}
							/>
						</Box>
					)}

					{address ? (
						<div className={classes.metamaskLAbel}>
							{stats ? (
								<>
									<Typography variant='subtitle1' color='primary'>
										{t('METAMASK_CONTINUE_TO_NEXT_STEP')}
									</Typography>
									<AddrItem stats={stats} addr={address} />
								</>
							) : (
								t('AUTH_WITH_METAMASK_LABEL', { args: [address] })
							)}
						</div>
					) : isMetamaskEthereumProvider ? (
						<Button
							onClick={checkMetamask}
							variant='contained'
							color='primary'
							disabled={waitingAddrsData}
						>
							{t('AUTH_CONNECT_WITH_METAMASK')}
						</Button>
					) : null}
				</Box>
			</ContentBody>
		</ContentBox>
	)
}

export default AuthMetamask
