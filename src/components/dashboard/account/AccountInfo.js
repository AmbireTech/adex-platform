import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { updateNav, addToast, execute } from 'actions'
import copy from 'copy-to-clipboard'
import Translate from 'components/translate/Translate'
import {
	WithdrawTokenFromIdentity,
	SetIdentityPrivilege,
} from 'components/dashboard/forms/web3/transactions'
import { makeStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListDivider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import CopyIcon from '@material-ui/icons/FileCopy'
import DownloadIcon from '@material-ui/icons/SaveAlt'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { styles } from './styles.js'
import { getRecoveryWalletData } from 'services/wallet/wallet'
import { LoadingSection } from 'components/common/spinners'
import CreditCardIcon from '@material-ui/icons/CreditCard'
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk'
import { selectAccount } from 'selectors'

// const RRButton = withReactRouterLink(Button)

const VALIDATOR_LEADER_URL = process.env.VALIDATOR_LEADER_URL
const VALIDATOR_LEADER_ID = process.env.VALIDATOR_LEADER_ID
const VALIDATOR_FOLLOWER_URL = process.env.VALIDATOR_FOLLOWER_URL
const VALIDATOR_FOLLOWER_ID = process.env.VALIDATOR_FOLLOWER_ID

function AccountInfo({ t }) {
	const account = useSelector(selectAccount)

	const localWalletDownloadHref = () => {
		const { email, password, authType } = account.wallet
		const obj = getRecoveryWalletData({ email, password, authType })
		if (!obj || !obj.wallet) {
			return null
		}

		const data =
			'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj))
		return data
	}

	const walletJsonData = localWalletDownloadHref()
	const [expanded, setExpanded] = useState(false)
	const useStyles = makeStyles(styles)
	const classes = useStyles()

	useEffect(() => {
		execute(updateNav('navTitle', t('ACCOUNT')))
	}, [t])

	const displayRampWidget = () => {
		const widget = new RampInstantSDK({
			hostAppName: 'AdExNetwork',
			hostLogoUrl: 'https://www.adex.network/img/Adex-logo@2x.png',
			variant: 'auto',
			swapAsset: 'DAI',
			userAddress: account.identity.address,
		})
		widget.domNodes.overlay.style.zIndex = 1000
		widget.show()
	}

	const handleExpandChange = () => {
		setExpanded(!expanded)
	}

	const { grantType } = account.settings
	const formatted = account.stats.formatted || {}
	const {
		walletAddress,
		walletAuthType = '',
		walletPrivileges = '',
		identityAddress,
		identityBalanceDai,
		availableIdentityBalanceDai,
		outstandingBalanceDai,
	} = formatted
	const { authType, email } = account.wallet

	return (
		<div>
			<List>
				<ListItem>
					<Box
						display='flex'
						flex='1'
						flexWrap={'wrap'}
						justifyContent='space-between'
						alignItems='center'
					>
						<Box
							flexGrow='3'
							mr={1}
							flexWrap={'wrap'}
							display='flex'
							alignItems='center'
							justifyContent='start'
						>
							<ListItemText
								className={classes.address}
								primary={identityAddress}
								secondary={
									account._authType === 'demo'
										? t('DEMO_ACCOUNT_IDENTITY_ADDRESS')
										: t('IDENTITY_ETH_ADDR')
								}
							/>
							<IconButton
								color='primary'
								onClick={() => {
									copy(identityAddress)
									execute(
										addToast({
											type: 'accept',
											action: 'X',
											label: t('COPIED_TO_CLIPBOARD'),
											timeout: 5000,
										})
									)
								}}
							>
								<CopyIcon />
							</IconButton>
						</Box>

						{walletJsonData && (
							<Box py={1} flexGrow='1'>
								<label htmlFor='download-wallet-json'>
									<a
										id='download-wallet-json'
										href={localWalletDownloadHref()}
										download={`adex-account-data-${email}.json`}
									>
										<Button size='small' variant='contained' fullWidth>
											<DownloadIcon className={classes.iconBtnLeft} />
											{t('BACKUP_LOCAL_WALLET')}
										</Button>
									</a>
								</label>
							</Box>
						)}
					</Box>
				</ListItem>
				<ListDivider />
				<ListItem>
					<ListItemText
						className={classes.address}
						primary={walletAddress}
						secondary={
							account.authType === 'demo'
								? t('DEMO_ACCOUNT_WALLET_ADDRESS', {
										args: [walletAuthType, walletPrivileges],
								  })
								: t('WALLET_INFO_LABEL', {
										args: [
											walletAuthType.replace(/^\w/, chr => {
												return chr.toUpperCase()
											}),
											walletPrivileges || ' - ',
											authType,
										],
								  })
						}
					/>
				</ListItem>
				<ListDivider />
				<ListItem>
					<Box
						display='flex'
						flexWrap={'wrap'}
						flex='1'
						justifyContent='space-between'
						alignItems='center'
					>
						<Box pr={1} flexGrow='8'>
							<LoadingSection
								loading={!identityBalanceDai && identityBalanceDai !== 0}
							>
								<ListItemText
									primary={`${availableIdentityBalanceDai || 0} DAI`}
									secondary={t('IDENTITY_DAI_BALANCE_AVAILABLE_INFO', {
										args: [identityBalanceDai || 0, outstandingBalanceDai || 0],
									})}
								/>
							</LoadingSection>
						</Box>
						<Box flexGrow='1'>
							<Box py={1}>
								<Button
									fullWidth
									variant='contained'
									color='secondary'
									aria-label='delete'
									onClick={() => displayRampWidget()}
									size='small'
								>
									<CreditCardIcon className={classes.iconBtnLeft} />
									{t('TOP_UP_IDENTITY_GBP')}
								</Button>
							</Box>

							{grantType !== 'advertiser' && (
								<Box py={1}>
									<WithdrawTokenFromIdentity
										fullWidth
										variant='contained'
										color='primary'
										identityAvailable={availableIdentityBalanceDai}
										identityAvailableRaw={availableIdentityBalanceDai}
										token='DAI'
										size='small'
									/>
								</Box>
							)}
						</Box>
					</Box>
				</ListItem>
				<ListDivider />
				<ExpansionPanel expanded={expanded} onChange={handleExpandChange}>
					<ExpansionPanelSummary
						expandIcon={<ExpandMoreIcon />}
						aria-controls='panel1bh-content'
						id='panel1bh-header'
					>
						<Typography className={classes.heading}>
							{t('ACCOUNT_ADVANCED_INFO_AND_ACTIONS')}
						</Typography>
					</ExpansionPanelSummary>
					<ExpansionPanelDetails>
						<List classes={{ root: classes.advancedList }}>
							<ListItem>
								<Box
									display='flex'
									flexWrap={'wrap'}
									flex='1'
									justifyContent='space-between'
									alignItems='center'
								>
									<Box pr={1} flexGrow='8'>
										<ListItemText
											className={classes.address}
											secondary={''}
											primary={t('MANAGE_IDENTITY')}
										/>
									</Box>
									<Box py={1} flexGrow='1'>
										<SetIdentityPrivilege
											fullWidth
											variant='contained'
											color='secondary'
											token='DAI'
											size='small'
											identityAvailable={availableIdentityBalanceDai}
										/>
									</Box>
								</Box>
							</ListItem>
							<ListDivider />
							<ListItem>
								<ListItemText
									className={classes.address}
									primary={t('VALIDATOR_LEADER_ID', {
										args: [VALIDATOR_LEADER_ID],
									})}
									secondary={t('VALIDATOR_LEADER_URL', {
										args: [VALIDATOR_LEADER_URL],
									})}
								/>
							</ListItem>
							<ListItem>
								<ListItemText
									className={classes.address}
									primary={t('VALIDATOR_FOLLOWER_ID', {
										args: [VALIDATOR_FOLLOWER_ID],
									})}
									secondary={t('VALIDATOR_FOLLOWER_URL', {
										args: [VALIDATOR_FOLLOWER_URL],
									})}
								/>
							</ListItem>
						</List>
					</ExpansionPanelDetails>
				</ExpansionPanel>
			</List>
		</div>
	)
}

AccountInfo.propTypes = {
	t: PropTypes.func.isRequired,
}

export default Translate(AccountInfo)
