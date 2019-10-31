import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Translate from 'components/translate/Translate'
import METAMASK_DL_IMG from 'resources/download-metamask.png'
import METAMASK_IMG from 'resources/metamask.png'
import Anchor from 'components/common/anchor/anchor'
import Img from 'components/common/img/Img'
import AuthHoc from './AuthHoc'
import { AUTH_TYPES } from 'constants/misc'
import { AddrItem } from './AuthCommon'
import { addToast, execute } from 'actions'
import {
	ContentBox,
	ContentBody,
	ContentStickyTop,
	TopLoading,
} from 'components/common/dialog/content'
import Helper from 'helpers/miscHelpers'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { getEthers } from 'services/smart-contracts/ethers'
import { getSigner } from 'services/smart-contracts/actions/ethers'
import { getAddressBalances } from 'services/smart-contracts/actions/stats'
import Box from '@material-ui/core/Box'

function AuthMetamask(props) {
	const [installingMetamask, setInstallingMetamask] = useState(false)
	const [address, setAddress] = useState(null)
	const [stats, setStats] = useState(null)
	const [waitingMetamaskAction, setWaitingMetamaskAction] = useState(false)
	const [waitingAddrsData, setWaitingAddrsData] = useState(false)
	const { t, classes } = props
	const isOpera =
		!!window.opr || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0

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
			})
			setAddress(address)
			setStats(stats)
			setWaitingAddrsData(false)

			props.updateWallet({
				address,
				authType: AUTH_TYPES.METAMASK.name,
				balanceEth: stats.balanceEth,
				balanceDai: stats.balanceDai,
				signType: AUTH_TYPES.METAMASK.signType,
			})
		} catch (err) {
			console.error('Error: catch', err)
			setWaitingMetamaskAction(false)
			setWaitingAddrsData(false)
			execute(
				addToast({
					type: 'cancel',
					action: 'X',
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
				<Typography paragraph variant='subheading'>
					{t('METAMASK_INFO')}
				</Typography>
				<Box
					display='flex'
					flexDirection='column'
					alignItems='center'
					justifyContent='center'
					width={1}
				>
					{!window.ethereum || !window.ethereum.isMetaMask ? (
						<React.Fragment>
							<Typography paragraph>
								<span
									dangerouslySetInnerHTML={{
										__html: t('METAMASK_BASIC_USAGE_INFO', {
											args: [
												{
													component: (
														<Anchor
															href={
																isOpera
																	? 'https://chrome.google.com/webstore/detail/nkbihfbeogaeaoehlefnkodbefgpgknn'
																	: 'https://metamask.io/'
															}
															target='_blank'
														>
															https://metamask.io/
														</Anchor>
													),
												},
											],
										}),
									}}
								/>
							</Typography>
							<Typography paragraph>
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
							</Typography>
						</React.Fragment>
					) : (
						<Typography paragraph>
							<Img
								src={METAMASK_IMG}
								alt={'Downlad metamask'}
								className={classes.dlBtnImg}
							/>
						</Typography>
					)}

					{address ? (
						<div className={classes.metamaskLAbel}>
							{stats ? (
								<div>
									<Typography paragraph variant='subheading' color='primary'>
										{t('METAMASK_CONTINUE_TO_NEXT_STEP')}
									</Typography>
									<AddrItem stats={stats} t={t} addr={address} />
								</div>
							) : (
								t('AUTH_WITH_METAMASK_LABEL', { args: [address] })
							)}
						</div>
					) : window.ethereum && window.ethereum.isMetaMask ? (
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

AuthMetamask.propTypes = {
	updateWallet: PropTypes.func.isRequired,
	t: PropTypes.func.isRequired,
	classes: PropTypes.object.isRequired,
}

export default Translate(AuthHoc(withStyles(styles)(AuthMetamask)))
