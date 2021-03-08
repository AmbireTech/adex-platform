import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import { WithdrawTokenFromIdentity } from 'components/dashboard/forms/web3/transactions'
import { makeStyles } from '@material-ui/core/styles'
import {
	List,
	ListItem,
	ListItemText,
	Button,
	Box,
	Grid,
} from '@material-ui/core'
import { ExternalAnchor } from 'components/common/anchor/anchor'
import { styles } from './styles.js'
import { LoadingSection } from 'components/common/spinners'
import CreditCardIcon from '@material-ui/icons/CreditCard'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc'
import {
	t,
	selectAccountStatsFormatted,
	selectWalletPrivileges,
	selectMainToken,
	selectSide,
} from 'selectors'
import { formatAddress } from 'helpers/formatters'

const VALIDATOR_LEADER_URL = process.env.VALIDATOR_LEADER_URL
const VALIDATOR_LEADER_ID = process.env.VALIDATOR_LEADER_ID
const VALIDATOR_FOLLOWER_URL = process.env.VALIDATOR_FOLLOWER_URL
const VALIDATOR_FOLLOWER_ID = process.env.VALIDATOR_FOLLOWER_ID

const RRButton = withReactRouterLink(Button)

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

export function PlatformBalance() {
	const privileges = useSelector(selectWalletPrivileges)
	const side = useSelector(selectSide)
	const canMakeTx = privileges > 1
	const { symbol } = useSelector(selectMainToken)
	const {
		identityBalanceMainToken,
		availableIdentityBalanceMainToken,
		availableIdentityBalanceAllMainToken,
	} = useSelector(selectAccountStatsFormatted)
	const classes = useStyles()

	return (
		<AccountItem
			left={
				<LoadingSection
					loading={!identityBalanceMainToken && identityBalanceMainToken !== 0}
				>
					<ListItemText
						className={classes.address}
						primary={`${availableIdentityBalanceAllMainToken || 0} ${symbol}`}
						secondary={t('IDENTITY_MAIN_TOKEN_BALANCE_INFO')}
					/>
					{availableIdentityBalanceAllMainToken !==
						availableIdentityBalanceMainToken && (
						<ListItemText
							className={classes.address}
							primary={`${availableIdentityBalanceMainToken || 0} ${symbol}`}
							secondary={t(
								'IDENTITY_MAIN_TOKEN_BALANCE_WITHDRAW_AVAILABLE_INFO',
								{
									args: [
										<ExternalAnchor href='https://help.adex.network/hc/en-us/articles/360016097580-Why-can-t-I-withdraw-my-entire-balance-'>
											{t('FIND_MORE')}
										</ExternalAnchor>,
									],
								}
							)}
						/>
					)}
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
	)
}

export function PlatformAdvanced(params) {
	const classes = useStyles()
	return (
		<List classes={{ root: classes.advancedList }}>
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
		</List>
	)
}
