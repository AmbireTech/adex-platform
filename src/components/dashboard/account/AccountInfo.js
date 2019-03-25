import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import copy from 'copy-to-clipboard'
import Translate from 'components/translate/Translate'
import { WithdrawEth, WithdrawTokens, DepositEth, DepositToken, WithdrawEthFromIdentity, WithdrawTokenFromIdentity } from 'components/dashboard/forms/web3/transactions'
import { withStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListDivider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import CopyIcon from '@material-ui/icons/FileCopy'
import { styles } from './styles.js'
import { getStatsValues } from 'helpers/accStatsHelpers'
import scActions from 'services/smart-contracts/actions'
import AirSwap from 'components/dashboard/forms/AirSwap'

const { getAccountStats } = scActions
// const RRButton = withReactRouterLink(Button)

class AccountInfo extends React.Component {

	componentWillMount() {
		this.props.actions.updateNav('navTitle', this.props.t('ACCOUNT'))
		this.getStats()
	}

	getStats = () => {
    	// TODO: spinner
    	/*getAccountStats*/ getAccountStats({ _addr: this.props.account._addr, authType: this.props.account._authType })
			.then((stats) => {
				this.props.actions.updateAccount({ ownProps: { stats: stats } })
			})
	}

	onSave = () => {
		this.getStats()
	}

	render() {
		const { t, account, classes } = this.props
		const stats = { ...account._stats }
		const {
		    walletAddress,
			walletAuthType,
			walletPrivilege,
			walletBalanceEth,
			walletBalanceDai,
			identityAddress,
			identityBalanceEth,
			identityBalanceDai,
			// identityPrivileges
		} = getStatsValues(stats)

		return (
			<div>
				<List
				// dense={true}
				>
					<ListItem>
						<ListItemText
							className={classes.address}
							primary={walletAddress}
							secondary={(account._authType === 'demo')
							 ? t('DEMO_ACCOUNT_WALLET_ADDRESS', {args: [walletAuthType, walletPrivilege]})
							  : t('WALLET_ETH_ADDR', {args: [walletAuthType, walletPrivilege]})
							}
						/>
						<IconButton
							color='default'
							onClick={() => {
								copy(walletAddress)
								this.props.actions
									.addToast({ type: 'accept', action: 'X', label: t('COPIED_TO_CLIPBOARD'), timeout: 5000 })
							}}
						>
							<CopyIcon />
						</IconButton>
					</ListItem>
					<ListDivider />
					<ListItem
					>
						<ListItemText
							primary={walletBalanceEth + ' ETH'}
							secondary={t('WALLET_ETH_BALANCE')}
						/>
						<div className={classes.itemActions}>
							<WithdrawEth
								variant='raised'
								color='primary'
								onSave={this.onSave}
								availableAmount={walletBalanceEth}
								tokenName='ETH'
								accAddr={walletAddress}
								className={classes.actionBtn}
								size='small'
							/>
						</div>
					</ListItem>
					<ListDivider />
					<ListItem
					>
						<ListItemText
							primary={walletBalanceDai + ' DAI'}
							secondary={t('WALLET_ADX_BALANCE')}
						/>
						<div className={classes.itemActions}>
							<WithdrawTokens
								variant='raised'
								color='primary'
								onSave={this.onSave}
								availableAmount={walletBalanceDai}
								tokenName='DAI'
								accAddr={walletAddress}
								className={classes.actionBtn}
								size='small'
							/>
							<AirSwap />
						</div>
					</ListItem>
					<ListDivider />
					<ListItem>
						<ListItemText
							className={classes.address}
							primary={identityAddress}
							secondary={(account._authType === 'demo')
							 ? t('DEMO_ACCOUNT_IDENTITY_ADDRESS')
							  : t('IDENTITY_ETH_ADDR')
							}
						/>
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
					<ListItem
					>
						<ListItemText
							primary={identityBalanceEth + ' ETH'}
							secondary={t('IDENTITY_ETH_BALANCE_AVAILABLE')}
						/>
						<div className={classes.itemActions}>
							<DepositEth
								variant='raised'
								color='secondary'
								onSave={this.onSave}
								walletBalanceEth={walletBalanceEth}
								className={classes.actionBtn}
								size='small'
							/>
							<WithdrawEthFromIdentity
								variant='raised'
								color='primary'
								onSave={this.onSave}
								identityAvailable={identityBalanceEth}
								className={classes.actionBtn}
								size='small'
							/>
						</div>
					</ListItem>
					<ListDivider />
					<ListItem
					>
						<ListItemText
							primary={identityBalanceDai + ' DAI'}
							secondary={t('IDENTITY_DAI_BALANCE_AVAILABLE')}
						/>
						<div className={classes.itemActions}>
							<DepositToken
								variant='raised'
								color='secondary'
								onSave={this.onSave}
								walletBalance={walletBalanceDai}
								token='DAI'
								className={classes.actionBtn}
								size='small'
							/>
							<WithdrawTokenFromIdentity
								variant='raised'
								color='primary'
								onSave={this.onSave}
								identityAvailable={identityBalanceDai}
								token='DAI'
								className={classes.actionBtn}
								size='small'
							/>
						</div>
					</ListItem>
					<ListDivider />
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
	const account = persist.account

	return {
		account: account,
		side: memory.nav.side,
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
