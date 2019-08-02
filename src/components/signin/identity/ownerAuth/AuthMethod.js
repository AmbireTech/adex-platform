import React, { Component } from 'react'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import AuthMetamask from './AuthMetamask'
import AuthTrezor from './AuthTrezor'
import AuthLedger from './AuthLedger'
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
		const { classes, location } = this.props
		const { search } = location || {}
		return (
			<Grid
				container
				spacing={2}
				direction='row'
				alignContent='flex-start'
			>
				<Grid
					item xs={12}
					className={classes.tabsContainer}
				>
					{(search === '?metamask') &&
						<AuthMetamask />
					}
					{(search === '?trezor') &&
						<AuthTrezor />
					}
					{(search === '?ledger') &&
						<AuthLedger />
					}
				</Grid>
			</Grid>
		)
	}
}

export default Translate(withStyles(styles)(AuthMethod))
