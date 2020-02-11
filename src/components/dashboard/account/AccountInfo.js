import React, { useState, useEffect, Fragment } from 'react'
import { useSelector } from 'react-redux'
import {
	WithdrawTokenFromIdentity,
	WithdrawAnyTokenFromIdentity,
	SetIdentityPrivilege,
	SetAccountENS,
} from 'components/dashboard/forms/web3/transactions'
import { makeStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListDivider from '@material-ui/core/Divider'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
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
import CopyIcon from '@material-ui/icons/FileCopy'
import IconButton from '@material-ui/core/IconButton'
import copy from 'copy-to-clipboard'
import {
	t,
	selectWallet,
	selectAccountStatsFormatted,
	selectAccountIdentityAddr,
	selectWalletPrivileges,
	selectMainToken,
	selectEasterEggsAllowed,
	selectEnsAddressByAddr,
} from 'selectors'
import { updateNav, execute, addToast } from 'actions'
import { formatAddress } from 'helpers/formatters'
// const RRButton = withReactRouterLink(Button)

const VALIDATOR_LEADER_URL = process.env.VALIDATOR_LEADER_URL
const VALIDATOR_LEADER_ID = process.env.VALIDATOR_LEADER_ID
const VALIDATOR_FOLLOWER_URL = process.env.VALIDATOR_FOLLOWER_URL
const VALIDATOR_FOLLOWER_ID = process.env.VALIDATOR_FOLLOWER_ID

const AccountItem = props => (
	<ListItem>
		<Box
			display='flex'
			flexWrap={'wrap'}
			flex='1'
			justifyContent='space-between'
			alignItems='center'
		>
			<Box
				flexGrow='8'
				flexBasis='700px'
				mr={1}
				flexWrap={'nowrap'}
				display='flex'
				alignItems='center'
				justifyContent='space-between'
			>
				<Box flex='1'>{props.left}</Box>
			</Box>
			<Box flexGrow='1' flexBasis='20em'>
				{props.right}
			</Box>
		</Box>
	</ListItem>
)

const useStyles = makeStyles(styles)

function AccountInfo() {
	const { authType = '', email, password } = useSelector(selectWallet)
	const identityAddress = useSelector(selectAccountIdentityAddr)
	const privileges = useSelector(selectWalletPrivileges)
	const canMakeTx = privileges > 1
	const { symbol } = useSelector(selectMainToken)
	const {
		walletAddress,
		identityBalanceMainToken,
		availableIdentityBalanceMainToken,
	} = useSelector(selectAccountStatsFormatted)

	const identityEnsName = useSelector(state =>
		selectEnsAddressByAddr(state, identityAddress)
	)

	const allowEasterEggs = useSelector(selectEasterEggsAllowed)

	const [localWalletDownloadHref, setLocalWalletDownloadHref] = useState('')

	const loadBackupHref = async () => {
		const obj = await getRecoveryWalletData({ email, password, authType })
		if (obj && obj.wallet) {
			const data =
				'data:text/json;charset=utf-8,' +
				encodeURIComponent(JSON.stringify(obj))

			setLocalWalletDownloadHref(data)
		}
	}

	const [expanded, setExpanded] = useState(false)

	const classes = useStyles()

	useEffect(() => {
		execute(updateNav('navTitle', t('ACCOUNT')))
	}, [identityAddress])

	useEffect(() => {
		loadBackupHref()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const displayRampWidget = () => {
		const widget = new RampInstantSDK({
			hostAppName: 'AdExNetwork',
			hostLogoUrl: 'https://www.adex.network/img/Adex-logo@2x.png',
			variant: 'auto',
			swapAsset: symbol,
			userAddress: identityAddress,
		})
		widget.domNodes.overlay.style.zIndex = 1000
		widget.show()
	}

	const handleExpandChange = () => {
		setExpanded(!expanded)
	}

	return (
		<div>
			<List>
				<AccountItem
					left={
						<Fragment>
							<ListItemText
								className={classes.address}
								primary={identityAddress}
								secondary={identityEnsName}
							/>
							<IconButton
								color='primary'
								onClick={() => {
									copy(identityAddress)
									execute(
										addToast({
											type: 'accept',
											label: t('COPIED_TO_CLIPBOARD'),
											timeout: 5000,
										})
									)
								}}
							>
								<CopyIcon />
							</IconButton>
						</Fragment>
					}
					right={
						!!identityAddress && (
							<SetAccountENS
								disabled={!canMakeTx}
								fullWidth
								variant='contained'
								color='primary'
								token='DAI'
								size='small'
								identityAvailable={availableIdentityBalanceMainToken}
							/>
						)
					}
				/>
				<ListDivider />
				<AccountItem
					left={
						<ListItemText
							className={classes.address}
							primary={formatAddress(walletAddress)}
							secondary={t('WALLET_INFO_LABEL', {
								args: [
									`AUTH_${authType.toUpperCase()}`,
									`PRIV_${privileges}_LABEL`,
									authType,
								],
							})}
						/>
					}
					right={
						localWalletDownloadHref && (
							<Box py={1} flexGrow='1'>
								<label htmlFor='download-wallet-json'>
									<a
										id='download-wallet-json'
										href={localWalletDownloadHref}
										download={`adex-account-data-${email}.json`}
									>
										<Button size='small' variant='contained' fullWidth>
											<DownloadIcon className={classes.iconBtnLeft} />
											{t('BACKUP_LOCAL_WALLET')}
										</Button>
									</a>
								</label>
							</Box>
						)
					}
				/>
				<ListDivider />
				<AccountItem
					left={
						<LoadingSection
							loading={
								!identityBalanceMainToken && identityBalanceMainToken !== 0
							}
						>
							<ListItemText
								className={classes.address}
								primary={`${availableIdentityBalanceMainToken || 0} ${symbol}`}
								secondary={t('IDENTITY_MAIN_TOKEN_BALANCE_AVAILABLE_INFO')}
							/>
						</LoadingSection>
					}
					right={
						<React.Fragment>
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
							<Box py={1}>
								<WithdrawTokenFromIdentity
									disabled={!canMakeTx}
									fullWidth
									variant='contained'
									color='primary'
									identityAvailable={availableIdentityBalanceMainToken}
									identityAvailableRaw={availableIdentityBalanceMainToken}
									token={symbol}
									size='small'
								/>
							</Box>
						</React.Fragment>
					}
				/>
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
							<AccountItem
								left={
									<ListItemText
										className={classes.address}
										secondary={''}
										primary={t('MANAGE_IDENTITY')}
									/>
								}
								right={
									<SetIdentityPrivilege
										disabled={!canMakeTx}
										fullWidth
										variant='contained'
										color='secondary'
										size='small'
										identityAvailable={availableIdentityBalanceMainToken}
									/>
								}
							></AccountItem>
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
							<ListDivider />
							{allowEasterEggs && (
								<ListItem>
									<Box
										display='flex'
										flexWrap={'wrap'}
										flex='1'
										justifyContent='space-between'
										alignItems='center'
									>
										<Box flexGrow='1'>
											<Box py={1}>
												<WithdrawAnyTokenFromIdentity
													fullWidth
													variant='contained'
													color='primary'
													size='small'
												/>
											</Box>
										</Box>
									</Box>
								</ListItem>
							)}
						</List>
					</ExpansionPanelDetails>
				</ExpansionPanel>
			</List>
		</div>
	)
}

export default AccountInfo
