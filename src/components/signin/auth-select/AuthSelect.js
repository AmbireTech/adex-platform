import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

const RRButton = withReactRouterLink(Button)

class AuthSelect extends Component {
	componentDidMount() {
		// NOTE: reset identity if someone press backspace 
		// to go to this page
		this.props.actions.resetIdentity()
	}

	render() {
		let { t } = this.props
		return (
			<div>
				<Grid
					container
					spacing={2}
					direction='column'
					alignItems='stretch'					
				>
					<Grid item xs={12}>
						<RRButton
							variant='contained'
							to='/identity/grant'
							size='large'
							color='primary'
							fullWidth
						>
							{t('CREATE_GRANT_ACCOUNT_')}
						</RRButton>
					</Grid>
					<Grid item xs={12}>
						<RRButton
							variant='contained'
							to='/login/grant'
							size='large'
							color='primary'
							fullWidth
						>
							{t('LOGIN_GRANT_ACCOUNT_')}
						</RRButton>
					</Grid>
					<Grid item xs={12}>
						<RRButton
							variant='contained'
							to='/login/full?metamask'
							size='large'
							color='primary'
							fullWidth
						>
							{t('METAMASK')}
						</RRButton>
					</Grid>
					<Grid item xs={12}>
						<RRButton
							variant='contained'
							to='/login/full?trezor'
							size='large'
							color='primary'
							fullWidth
						>
							{t('TREZOR')}
						</RRButton>
					</Grid>

				</Grid>
			</div>
		)
	}
}

export default Translate(withStyles(styles)(AuthSelect))
