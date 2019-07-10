import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import copy from 'copy-to-clipboard'
import Translate from 'components/translate/Translate'
import {
	WithdrawTokenFromIdentity,
	SetIdentityPrivilege
} from 'components/dashboard/forms/web3/transactions'
import { withStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListDivider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import CopyIcon from '@material-ui/icons/FileCopy'
import DownloadIcon from '@material-ui/icons/SaveAlt'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { styles } from './styles.js'
import { getRecoveryWalletData } from 'services/wallet/wallet'

// const RRButton = withReactRouterLink(Button)

class AccountInfo extends React.Component {
	// eslint-disable-next-line no-useless-constructor
	constructor(props) {
		super(props)
		this.state = {
			walletJsonData: this.localWalletDownloadHref(),
			expanded: false
		}
	}

	UNSAFE_componentWillMount() {
		const { t, actions, account } = this.props
		const { updateNav, updateAccountStats } = actions
		updateNav('navTitle', t('ACCOUNT'))
		updateAccountStats(account)
	}

	localWalletDownloadHref = () => {
		const { account } = this.props
		const { email, password } = account.wallet
		const obj = getRecoveryWalletData({ email, password })
		if (!obj) {
			return null
		}
		const data = "data:text/json;charset=utf-8,"
			+ encodeURIComponent(JSON.stringify(obj))
		return data
	}

	onSave = () => {
		// this.getStats()
	}

	handleExpandChange = () => {
		this.setState({ expanded: !this.state.expanded })
	}

	render() {
		const { t, account, classes, actions } = this.props
		const formatted = account.stats.formatted || {}
		const {
			walletAddress,
			walletAuthType,
			walletPrivileges,
			walletBalanceEth,
			walletBalanceDai,
			identityAddress,
			identityBalanceDai
		} = formatted

		const { authType, email } = account.wallet
		const { walletJsonData, expanded } = this.state

		return (
			<div>
				<List
				// dense={true}
				>
					<ListItem>
						<ListItemText
							className={classes.address}
							primary={identityAddress}
							secondary={(account._authType === 'demo')
								? t('DEMO_ACCOUNT_IDENTITY_ADDRESS')
								: t('IDENTITY_ETH_ADDR')
							}
						/>
						{walletJsonData &&
							<label htmlFor='download-wallet-json'>
								<a
									id='download-wallet-json'
									href={this.localWalletDownloadHref()}
									download={`adex-account-data-${email}.json`}
								>
									<Button
										size='small'
										variant='contained'
									>
										{t('BACKUP_LOCAL_WALLET')}
										<DownloadIcon />
									</Button>
								</a>
							</label>
						}
						<IconButton
							color='default'
							onClick={() => {
								copy(identityAddress)
								this.props.actions
									.addToast({ type: 'accept', action: 'X', label: t('COPIED_TO_CLIPBOARD'), timeout: 5000 })
							}}
						>
							<CopyIcon />
						</IconButton>
					</ListItem>
					<ListDivider />
					<ListItem>
						<ListItemText
							className={classes.address}
							secondary={walletAddress}
							primary={(account.authType === 'demo')
								? t('DEMO_ACCOUNT_WALLET_ADDRESS', { args: [walletAuthType, walletPrivileges] })
								: t('WALLET_INFO_LABEL', { args: [walletAuthType, walletPrivileges || ' - ', authType] })
							}
						/>
					</ListItem>
					<ListDivider />
					<ListItem
					>
						<ListItemText
							primary={identityBalanceDai + ' DAI'}
							secondary={t('IDENTITY_DAI_BALANCE_AVAILABLE')}
						/>
						<div className={classes.itemActions}>
							<WithdrawTokenFromIdentity
								variant='contained'
								color='primary'
								onSave={this.onSave}
								identityAvailable={identityBalanceDai}
								identityAvailableRaw={identityBalanceDai}
								token='DAI'
								className={classes.actionBtn}
								size='small'
								actions={actions}

							/>
						</div>
					</ListItem>
					<ListDivider />
					<ExpansionPanel expanded={expanded} onChange={this.handleExpandChange}>
						<ExpansionPanelSummary
							expandIcon={<ExpandMoreIcon />}
							aria-controls="panel1bh-content"
							id="panel1bh-header"
						>
							<Typography className={classes.heading}>{t('ACCOUNT_ADVANCED_INFO_AND_ACTIONS')}</Typography>
						</ExpansionPanelSummary>
						<ExpansionPanelDetails>
							<ListItem>
								<ListItemText
									className={classes.address}
									secondary={''}
									primary={t('MANAGE_IDENTITY')}
								/>
								<div className={classes.itemActions}>
									<SetIdentityPrivilege
										variant='contained'
										color='secondary'
										onSave={this.onSave}
										token='DAI'
										className={classes.actionBtn}
										size='small'
										actions={actions}

									/>
								</div>
							</ListItem>
						</ExpansionPanelDetails>
					</ExpansionPanel>
				</List>
			</div>
		)
	}
}

AccountInfo.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
	const { persist, memory } = state
	const { account } = persist

	return {
		account: account,
		side: memory.nav.side
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(withStyles(styles)(Translate(AccountInfo)))
