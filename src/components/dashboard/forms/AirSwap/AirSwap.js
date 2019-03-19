import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { cfg } from 'services/smart-contracts/ADX'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListDivider from '@material-ui/core/Divider'
import Translate from 'components/translate/Translate'
import WithDialog from 'components/common/dialog/WithDialog'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import AirSwapIcon from 'components/common/icons/AirSwap'
import AirSwapWithTxtIcon from 'components/common/icons/AirSwapWithTxt'
import Anchor from 'components/common/anchor/anchor'
import Img from 'components/common/img/Img'
import { getAuthLogo } from 'helpers/logosHelpers'
import { getStatsValues } from 'helpers/accStatsHelpers'
import StatsCard from 'components/dashboard/containers/DashboardStats/StatsCard'
const AirSwap = window.AirSwap

const AirSwapDialogBody = ({ t, onBuy, onSell, classes, account }) => {
	const {
		addrBalanceAdx,
		addrBalanceEth,
	} = getStatsValues(account._stats)

	return (
		<div className={classes.paper}>
			<div>
				<List
					// dense={true}
				>
					<ListDivider />
					<ListItem  >
						<ListItemText
							secondary={t('AIRSWAP_INFO_MSG')}
							primary={
								<Anchor
									className={classes.iconLink}
									href='https://www.airswap.io/'
									target='_blank'
									style={{ color: 'inherit' }}
								>
									<AirSwapWithTxtIcon className={classes.linkIcon} />
								</Anchor>
							}
						/>
					</ListItem>
					<ListDivider />
					<ListItem  >
						<ListItemText
							primary={t('AIRSWAP_WARNING_MSG')}
							// secondary={t('AIRSWAP_WARNING')}
							primaryTypographyProps={{ color: 'primary' }}
							// secondaryTypographyProps={{ color: 'default' }}
						/>
					</ListItem>
					<ListDivider />
					<ListItem  >
						<ListItemText
							className={classes.addr}
							primary={account._addr}
							secondary={t('CURRENT_AUTH_ADDR')}
						/>
					</ListItem>
					<ListDivider />
					<ListItem  >
						<ListItemText
							primary={<Img src={getAuthLogo(account._authType)} style={{ maxHeight: 32, width: 'auto' }} />}
							secondary={t('CURRENT_AUTH_METOHD')}
						/>
					</ListItem>
					<ListDivider />
				</List>
				<div className={classes.infoStatsContainer}>
					<StatsCard
						linkCard
						subtitle={t('ACCOUNT_ETH_BALANCE')}
						title={addrBalanceEth + ' ETH'}
						padding='dense'
					>
					</StatsCard>

					<StatsCard
						linkCard
						subtitle={t('ACCOUNT_ADX_BALANCE')}
						title={addrBalanceAdx + ' ADX'}
						padding='dense'
					>
					</StatsCard>
				</div>
			</div>
		</div >
	)
}

const AirSwapDialog = WithDialog(AirSwapDialogBody)

class AirSwapWidget extends Component {
	componentWillMount() {
	}

    onSwap = ({ mode }) => {
    	const { t, actions } = this.props
    	AirSwap.Trader.render({
    		env: 'production',
    		mode: mode,
    		token: cfg.addr.token,
    		onCancel: () => {
    			actions.addToast({ type: 'warning', action: 'X', label: t('TRANSACTION_CANCELED'), timeout: 5000 })
    		},
    		onComplete: (transactionId) => {

    			// TODO: Get data when available
    			// const txData = {
    			//     trHash: transactionId,
    			//     trMethod: `TX_MTD_AIRSWAP_${mode.toUpperCase()}`
    			// }
    			// actions.addWeb3Transaction({ trans: txData, addr: 'GET_THE_ADDR' })
    			actions.addToast({ type: 'accept', action: 'X', label: t('TRANSACTION_SENT_MSG', { args: [transactionId] }), timeout: 5000 })
    		},
    		//TODO: add onTransactionHash when possible
    	}, 'body')
    }

    render() {
    	const { classes, t } = this.props
    	return (
    		<AirSwapDialog
    			classes={classes}
    			btnLabel='BUY_SELL_ADX_AIRSWAP_BTN'
    			title='BUY_SELL_ADX_AIRSWAP_DIALOG_TITLE'
    			variant='contained'
    			size='small'
    			color='default'
    			icon={<AirSwapIcon />}
    			onBuy={() => this.onSwap({ mode: 'buy' })}
    			onSell={() => this.onSwap({ mode: 'sell' })}
    			account={this.props.account}
    			dialogActions={
    				<div
    					className={classes.btns}
    				>
    					<Button
    						className={classes.actionBtn}
    						color='primary'
    						variant='contained'
    						size='large'
    						onClick={() => this.onSwap({ mode: 'buy' })}
    					>
    						<AirSwapIcon
    							className={classes.btnIconLeft}
    						/>
    						{t('BUY_ADX_AIRSWAP')}
    					</Button>
    					<Button
    						className={classes.actionBtn}
    						color='primary'
    						variant='contained'
    						size='large'
    						onClick={() => this.onSwap({ mode: 'sell' })}
    					>
    						<AirSwapIcon
    							className={classes.btnIconLeft}
    						/>
    						{t('SELL_ADX_AIRSWAP')}
    					</Button>
    				</div>
    			}
    		/>
    	)
    }
}

AirSwapWidget.propTypes = {
	actions: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
	const { persist } = state

	return {
		account: persist.account
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
)(Translate(withStyles(styles)(AirSwapWidget)))
