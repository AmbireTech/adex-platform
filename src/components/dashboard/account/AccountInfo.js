import React, { useState, Fragment } from 'react'
import { useSelector } from 'react-redux'
import {
	WithdrawTokenFromIdentity,
	WithdrawAnyTokenFromIdentity,
	SetIdentityPrivilege,
	SetAccountENS,
} from 'components/dashboard/forms/web3/transactions'
import { makeStyles } from '@material-ui/core/styles'
import {
	List,
	ListItem,
	ListItemText,
	Divider as ListDivider,
	ListSubheader,
	Button,
	Box,
	ExpansionPanel,
	ExpansionPanelSummary,
	Typography,
	IconButton,
	Paper,
	Chip,
	Grid,
} from '@material-ui/core'
import { VpnKey, LockOpen } from '@material-ui/icons'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { styles } from './styles.js'
import { LoadingSection } from 'components/common/spinners'
import CreditCardIcon from '@material-ui/icons/CreditCard'
import CopyIcon from '@material-ui/icons/FileCopy'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
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
	selectAccountIdentityCurrentPrivileges,
	selectIdentityRecoveryAddr,
	selectSide,
} from 'selectors'
import { execute, addToast, updateNewTransaction } from 'actions'
import { formatAddress } from 'helpers/formatters'

const RRButton = withReactRouterLink(Button)

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
			<Box flexGrow='1' flexBasis='17em'>
				{props.right}
			</Box>
		</Box>
	</ListItem>
)

const useStyles = makeStyles(styles)

function AccountInfo() {
	const { authType = '' } = useSelector(selectWallet)
	const identityAddress = useSelector(selectAccountIdentityAddr)
	const privileges = useSelector(selectWalletPrivileges)
	const side = useSelector(selectSide)
	const canMakeTx = privileges > 1
	const currentPrivileges = useSelector(selectAccountIdentityCurrentPrivileges)
	const identityRecoveryAddr = useSelector(selectIdentityRecoveryAddr)
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

	const [expanded, setExpanded] = useState(false)

	const classes = useStyles()

	const handleExpandChange = () => {
		setExpanded(!expanded)
	}

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
										secondary: t('ENS_NOT_SET'),
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
						right={
							!!identityAddress && (
								<SetAccountENS
									disabled={!canMakeTx}
									fullWidth
									variant='contained'
									color='default'
									token='DAI'
									size='large'
									identityAvailable={availableIdentityBalanceMainToken}
								/>
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
									primary={`${availableIdentityBalanceMainToken ||
										0} ${symbol}`}
									secondary={t('IDENTITY_MAIN_TOKEN_BALANCE_AVAILABLE_INFO')}
								/>
							</LoadingSection>
						}
						right={
							<Fragment>
								<Box py={1}>
									<RRButton
										to={`/dashboard/${side}/topup`}
										fullWidth
										variant='contained'
										color='secondary'
										aria-label='delete'
										size='large'
									>
										<CreditCardIcon className={classes.iconBtnLeft} />
										{t('TOP_UP')}
									</RRButton>
								</Box>
								<Box py={1}>
									<WithdrawTokenFromIdentity
										disabled={!canMakeTx}
										fullWidth
										variant='contained'
										color='default'
										identityAvailable={availableIdentityBalanceMainToken}
										identityAvailableRaw={availableIdentityBalanceMainToken}
										token={symbol}
										size='large'
									/>
								</Box>
							</Fragment>
						}
					/>
				</List>
			</Paper>
			<Box mt={1}>
				<ExpansionPanel
					expanded={expanded}
					onChange={handleExpandChange}
					square={true}
					variant='outlined'
				>
					<ExpansionPanelSummary
						expandIcon={<ExpandMoreIcon />}
						aria-controls='panel1bh-content'
						id='panel1bh-header'
					>
						<Typography className={classes.heading}>
							{t('ACCOUNT_ADVANCED_INFO_AND_ACTIONS')}
						</Typography>
					</ExpansionPanelSummary>
					<Box>
						<AccountItem
							left={
								<ListItemText
									className={classes.address}
									secondary={''}
									primary={t('WALLETS_WITH_PRIVILEGES')}
								/>
							}
						/>
						<ListDivider />
						<List classes={{ root: classes.scrollableList }}>
							<AccountPrivilageItem
								address={walletAddress}
								privileges={privileges}
								authType={authType}
								current
							/>
							<ListDivider />
							{Object.keys(currentPrivileges)
								.filter(a => a !== identityRecoveryAddr && a !== walletAddress)
								.map(address => (
									<Fragment>
										<AccountPrivilageItem
											address={address}
											privileges={currentPrivileges[address]}
										/>
										<ListDivider />
									</Fragment>
								))}
						</List>
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
										color='default'
										size='large'
										identityAvailable={availableIdentityBalanceMainToken}
									/>
								}
							/>
							<ListDivider />
							<ListItem>
								<ListItemText
									className={classes.address}
									primary={t('VALIDATOR_LEADER_ID', {
										args: [formatAddress(VALIDATOR_LEADER_ID)],
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
										args: [formatAddress(VALIDATOR_FOLLOWER_ID)],
									})}
									secondary={t('VALIDATOR_FOLLOWER_URL', {
										args: [VALIDATOR_FOLLOWER_URL],
									})}
								/>
							</ListItem>

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
				</ExpansionPanel>
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
							primary={
								<Typography>
									{formatAddress(address)}
									{current && (
										<Chip
											icon={<LockOpen />}
											color={privColors[currUserPrivileges]}
											size='small'
											label={authType.toUpperCase()}
											classes={{ root: classes.currentChip }}
										/>
									)}
								</Typography>
							}
							secondary={t('WALLET_PRIV_LABEL', {
								args: [`PRIV_${privileges}_LABEL`],
							})}
						/>
					</Grid>
				</Grid>
			}
			right={
				<SetIdentityPrivilege
					disabled={!canMakeTx}
					fullWidth
					color='default'
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
					// size='large'
					// identityAvailable={availableIdentityBalanceMainToken}
				/>
			}
		/>
	)
}

export default AccountInfo
