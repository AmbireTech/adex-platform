import React, { Component } from 'react'
import Translate from 'components/translate/Translate'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import AppBar from '@material-ui/core/AppBar'
import AuthMetamask from './AuthMetamask'
import AuthTrezor from './AuthTrezor'
import AuthLedger from './AuthLedger'
import METAMASK_DL_IMG from 'resources/download-metamask.png'
import LEDGER_DL_IMG from 'resources/ledger_logo_header.png'
import TREZOR_DL_IMG from 'resources/trezor-logo-h.png'
import Img from 'components/common/img/Img'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

class AuthMethod extends Component {

	constructor(props) {
		super(props)
		this.state = {
			tabIndex: 0,
			bids: []
		}
	}

	handleTabChange = (event, index) => {
		this.setState({ tabIndex: index })
	}

	render() {
		const { t, classes } = this.props
		const { tabIndex } = this.state
		return (
			<div>
				<AppBar
					position='static'
					color='default'
				>
					<Tabs
						value={this.state.tabIndex}
						onChange={this.handleTabChange}
						scrollable
						scrollButtons='off'
						indicatorColor='primary'
						textColor='inherit'
						variant='fullWidth'
					>
						<Tab
							// label={t('METAMASK')}
							classes={{ label: classes.tabLabel }}
							label={<Img
								src={METAMASK_DL_IMG}
								alt={t('AUTH_WITH_METAMASK')}
								className={classes.tabLogo}
							/>}
						/>
						<Tab
							// label={t('TREZOR')}
							classes={{ label: classes.tabLabel }}
							label={<Img
								src={TREZOR_DL_IMG}
								alt={t('AUTH_WITH_TREZOR')}
								className={classes.tabLogo}
							/>}
						/>
						<Tab
							// label={t('LEDGER')}
							classes={{ label: classes.tabLabel }}
							label={<Img
								src={LEDGER_DL_IMG}
								alt={t('AUTH_WITH_LEDGER')}
								className={classes.tabLogo}
							/>}
						/>
					</Tabs>
				</AppBar>
				<div className={classes.tabsContainer}>
					{(tabIndex === 0) &&
						<AuthMetamask />
					}
					{(tabIndex === 1) &&
						<AuthTrezor />
					}
					{(tabIndex === 2) &&
						<AuthLedger />
					}
				</div>
			</div>
		)
	}
}

export default Translate(withStyles(styles)(AuthMethod))
