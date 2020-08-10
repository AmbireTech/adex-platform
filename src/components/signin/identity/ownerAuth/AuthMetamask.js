import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import METAMASK_DL_IMG from 'resources/download-metamask.png'
import METAMASK_IMG from 'resources/metamask.png'
import Anchor from 'components/common/anchor/anchor'
import { AUTH_TYPES } from 'constants/misc'
import { AddrItem } from './AuthCommon'
import {
	ContentBox,
	ContentBody,
	TopLoading,
} from 'components/common/dialog/content'
import { makeStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import Box from '@material-ui/core/Box'
import { checkAuthMetamask, execute } from 'actions'
import { getEthereumProviderName } from 'services/smart-contracts/ethers'
import { t, selectIdentity, selectSpinnerById } from 'selectors'
import { CHECKING_METAMASK_AUTH } from 'constants/spinners'

const useStyles = makeStyles(styles)

function AuthMetamask() {
	const classes = useStyles()
	const { wallet = {}, stats } = useSelector(selectIdentity)
	const { address } = wallet
	const [installingMetamask, setInstallingMetamask] = useState(false)
	const isOpera =
		!!window.opr || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0
	const [isMetamaskEthereumProvider, setIsMetamaskEthereumProvider] = useState(
		false
	)

	const waitingAddrsData = useSelector(state =>
		selectSpinnerById(state, CHECKING_METAMASK_AUTH)
	)

	useEffect(() => {
		const setEth = async () => {
			const ethereumProvider = await getEthereumProviderName()
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

	return (
		<ContentBox className={classes.tabBox}>
			{waitingAddrsData ? (
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
									<img
										src={METAMASK_DL_IMG}
										alt={'Downlad metamask'}
										className={classes.dlBtnImg}
									/>
								</Anchor>
							</Box>
						</Box>
					) : (
						<Box mb={2}>
							<img
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
							onClick={() => execute(checkAuthMetamask())}
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
