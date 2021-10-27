import React, { useState, Fragment } from 'react'
import { useSelector } from 'react-redux'
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
import { styles } from 'components/dashboard/account/styles.js'
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
} from 'selectors'
import { execute, addToast, updateNewTransaction } from 'actions'
import { formatAddress } from 'helpers/formatters'

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

function WalletPrivileges() {
	const { authType = '' } = useSelector(selectWallet)
	// const identityAddress = useSelector(selectAccountIdentityAddr)
	const privileges = useSelector(selectWalletPrivileges)
	const canMakeTx = privileges
	const currentPrivileges = useSelector(selectAccountIdentityCurrentPrivileges)
	const identityRecoveryAddr = useSelector(selectIdentityRecoveryAddr)
	const { walletAddress, availableIdentityBalanceMainToken } = useSelector(
		selectAccountStatsFormatted
	)

	// const identityEnsName = useSelector(state =>
	// 	selectEnsAddressByAddr(state, identityAddress)
	// )

	const allowEasterEggs = useSelector(selectEasterEggsAllowed)

	const [expanded, setExpanded] = useState(false)

	const classes = useStyles()

	return (
		<Fragment>
			<Box mt={1}>
				<Box>
					<AccountItem
						left={
							<ListItemText
								className={classes.address}
								secondary={''}
								primary={t('MANAGE_IDENTITY')}
							/>
						}
						right={
							<WalletSetIdentityPrivilege
								// TODO: Remove comment below
								// disabled={!canMakeTx}
								fullWidth
								variant='contained'
								color='secondary'
								size='large'
								identityAvailable={availableIdentityBalanceMainToken}
							/>
						}
					/>
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
										<Box flexGrow='1'></Box>
									</Box>
								</ListItem>
							</Fragment>
						)}
					</List>
				</Box>
			</Box>
		</Fragment>
	)
}

function AccountPrivilageItem(props) {
	const classes = useStyles()
	const currUserPrivileges = useSelector(selectWalletPrivileges)
	const canMakeTx = currUserPrivileges
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
						<WalletSetIdentityPrivilege
							// TODO: Remove comment below
							// disabled={!canMakeTx}
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

export default WalletPrivileges
