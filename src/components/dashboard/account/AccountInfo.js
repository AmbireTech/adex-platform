import React, { useState, Fragment } from 'react'
import { useSelector } from 'react-redux'
import {
	WithdrawAnyTokenFromIdentity,
	SetIdentityPrivilege,
	SetAccountENS,
} from 'components/dashboard/forms/web3/transactions'
import { WalletSetIdentityPrivilege } from 'components/wallet/forms/walletTransactions'
import { makeStyles } from '@material-ui/core/styles'
import {
	List,
	ListItem,
	ListItemText,
	Divider as ListDivider,
	ListSubheader,
	Button,
	Box,
	Accordion,
	AccordionSummary,
	Typography,
	IconButton,
	Paper,
	Grid,
	Tooltip,
} from '@material-ui/core'
import { InfoSharp } from '@material-ui/icons'
import { VpnKey, Lock } from '@material-ui/icons'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { ExternalAnchor } from 'components/common/anchor/anchor'
import { styles } from './styles.js'
import CopyIcon from '@material-ui/icons/FileCopy'
import copy from 'copy-to-clipboard'
import {
	t,
	selectWallet,
	selectAccountStatsFormatted,
	selectAccountIdentityAddr,
	selectWalletPrivileges,
	selectEasterEggsAllowed,
	selectEnsAddressByAddr,
	selectAccountIdentityCurrentPrivileges,
	selectIdentityRecoveryAddr,
	selectIsPlatform,
} from 'selectors'
import { execute, addToast, updateNewTransaction } from 'actions'
import { formatAddress } from 'helpers/formatters'
import { PlatformBalance, PlatformAdvanced } from './accountPlatform'

const AccountItem = ({ left, right }) => {
	const classes = useStyles()
	return (
		<ListItem>
			<Grid
				container
				className={classes.root}
				spacing={1}
				justify='center'
				alignItems='center'
			>
				<Grid item xs={12} sm={6} md={9}>
					{left}
				</Grid>
				<Grid item xs={12} sm={6} md={3}>
					{right}
				</Grid>
			</Grid>
		</ListItem>
	)
}

const useStyles = makeStyles(styles)

function AccountInfo() {
	const { authType = '' } = useSelector(selectWallet)
	const identityAddress = useSelector(selectAccountIdentityAddr)
	const privileges = useSelector(selectWalletPrivileges)
	const canMakeTx = privileges > 1
	const currentPrivileges = useSelector(selectAccountIdentityCurrentPrivileges)
	const identityRecoveryAddr = useSelector(selectIdentityRecoveryAddr)
	const { walletAddress, availableIdentityBalanceMainToken } = useSelector(
		selectAccountStatsFormatted
	)

	const identityEnsName = useSelector(state =>
		selectEnsAddressByAddr(state, identityAddress)
	)

	const allowEasterEggs = useSelector(selectEasterEggsAllowed)

	const [expanded, setExpanded] = useState(false)

	const classes = useStyles()

	const handleExpandChange = () => {
		setExpanded(!expanded)
	}

	const isPlatform = useSelector(selectIsPlatform)

	return (
		<Fragment>
			<Paper variant='outlined'>
				<List className={classes.root} disablePadding>
					<ListSubheader disableSticky>{t('ADEX_ACCOUNT')}</ListSubheader>
					<AccountItem
						left={
							<Box display='flex' flexDirection='row' flexWrap='wrap'>
								<ListItemText
									className={classes.address}
									{...(identityEnsName && {
										primary: identityEnsName,
										secondary: identityAddress,
									})}
									{...(!identityEnsName && {
										primary: identityAddress,
										// secondary: (
										// 	<span className={classes.infoLabel}>
										// 		{t('ENS_NOT_SET')}
										// 		<Tooltip
										// 			interactive
										// 			arrow
										// 			title={t('ENS_NOT_SET_INFO', {
										// 				args: [
										// 					<ExternalAnchor href='https://help.adex.network/hc/en-us/articles/360017777100-What-is-an-Account-Username-and-how-to-set-it-'>
										// 						{t('HERE')}
										// 					</ExternalAnchor>,
										// 					'',
										// 				],
										// 			})}
										// 		>
										// 			<InfoSharp
										// 				className={classes.extraInfo}
										// 				fontSize='small'
										// 				color='primary'
										// 			/>
										// 		</Tooltip>
										// 	</span>
										// ),
									})}
								/>
								<IconButton
									color='default'
									onClick={() => {
										copy(identityAddress)
										execute(
											addToast({
												type: 'info',
												label: t('COPIED_TO_CLIPBOARD'),
												timeout: 5000,
											})
										)
									}}
								>
									<CopyIcon />
								</IconButton>
							</Box>
						}
						// right={
						// 	!!identityAddress && (
						// 		<SetAccountENS
						// 			disabled={!canMakeTx}
						// 			fullWidth
						// 			variant='contained'
						// 			color='default'
						// 			token='DAI'
						// 			size='large'
						// 			identityAvailable={availableIdentityBalanceMainToken}
						// 		/>
						// 	)
						// }
					/>
					{isPlatform && <PlatformBalance />}
				</List>
			</Paper>
			<Box mt={1}>
				<Accordion
					expanded={expanded}
					onChange={handleExpandChange}
					variant='outlined'
				>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						aria-controls='panel1bh-content'
						id='panel1bh-header'
					>
						<Typography className={classes.heading}>
							{t('ACCOUNT_ADVANCED_INFO_AND_ACTIONS')}
						</Typography>
					</AccordionSummary>
					<Box>
						{/* <ListDivider />
						<AccountItem
							left={
								<ListItemText
									className={classes.address}
									secondary={''}
									primary={t('MANAGE_IDENTITY')}
								/>
							}
							right={
								isPlatform ? (
									<SetIdentityPrivilege
										disabled={!canMakeTx}
										fullWidth
										variant='contained'
										color='secondary'
										size='large'
										identityAvailable={availableIdentityBalanceMainToken}
									/>
								) : (
									<WalletSetIdentityPrivilege
										disabled={!canMakeTx}
										fullWidth
										variant='contained'
										color='secondary'
										size='large'
										identityAvailable={availableIdentityBalanceMainToken}
									/>
								)
							}
						/> */}
						<ListDivider />
						<ListSubheader disableSticky>
							{t('WALLETS_WITH_PRIVILEGES')}
						</ListSubheader>
						<List disablePadding>
							<AccountPrivilageItem
								address={walletAddress}
								privileges={privileges}
								authType={authType}
								current
							/>
							{Object.keys(currentPrivileges)
								.filter(a => a !== identityRecoveryAddr && a !== walletAddress)
								.map((address, key) => (
									<Fragment key={key}>
										<AccountPrivilageItem
											address={address}
											privileges={currentPrivileges[address]}
										/>
									</Fragment>
								))}
						</List>
						<ListDivider />
						{isPlatform && <PlatformAdvanced />}

						<List classes={{ root: classes.advancedList }}>
							{allowEasterEggs && (
								<Fragment>
									<ListDivider />
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
														color='default'
														size='large'
													/>
												</Box>
											</Box>
										</Box>
									</ListItem>
								</Fragment>
							)}
						</List>
					</Box>
				</Accordion>
			</Box>
		</Fragment>
	)
}

function AccountPrivilageItem(props) {
	const classes = useStyles()
	const currUserPrivileges = useSelector(selectWalletPrivileges)
	const canMakeTx = currUserPrivileges > 1
	const { address, privileges, current, authType } = props
	const privColors = ['disabled', 'secondary', 'primary']
	const { availableIdentityBalanceMainToken } = useSelector(
		selectAccountStatsFormatted
	)
	return (
		<AccountItem
			left={
				<Grid
					container
					direction='row'
					spacing={2}
					alignItems='center'
					justify='flex-start'
				>
					<Grid item>
						<VpnKey color={privColors[privileges]} />
					</Grid>
					<Grid item>
						<ListItemText
							className={classes.address}
							primary={<Typography>{formatAddress(address)}</Typography>}
							secondary={t('WALLET_PRIV_LABEL', {
								args: [`PRIV_${privileges}_LABEL`],
							})}
						/>
					</Grid>
				</Grid>
			}
			right={
				<Grid container direction='row' justify='center' alignItems='center'>
					{current ? (
						<Button
							variant='contained'
							fullWidth
							disabled
							startIcon={<Lock />}
							size='large'
							color={privColors[currUserPrivileges]}
						>
							{`${t('CURRENT_AUTH')} : ${authType}`}
						</Button>
					) : (
						<SetIdentityPrivilege
							disabled={!canMakeTx}
							fullWidth
							color='default'
							variant='contained'
							label='CHANGE_PRIVILEGE'
							onClick={() =>
								execute(
									updateNewTransaction({
										tx: 'setIdentityPrivilege',
										key: 'setAddr',
										value: address,
									})
								)
							}
							size='large'
							identityAvailable={availableIdentityBalanceMainToken}
						/>
					)}
				</Grid>
			}
		/>
	)
}

export default AccountInfo
