import React, { Component } from 'react'
import IdentityHoc from './IdentityHoc'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

class QuickRecover extends Component {
	componentDidMount() {}

	render() {
		const { t, classes, actions } = this.props
		return (
			<Grid
				container
				spacing={2}
				alignContent='space-between'
				alignItems='center'
			>
				<Grid item xs={12}>
					<input
						accept='text/json'
						className={classes.input}
						id='contained-button-file'
						type='file'
						onChange={actions.onUploadLocalWallet}
					/>
					<label htmlFor='contained-button-file'>
						<Button component='span' className={classes.button}>
							{t('UPLOAD_ACCOUNT_DATA_JSON')}
						</Button>
					</label>
				</Grid>
			</Grid>
		)
	}
}

const IdentityQuickRecoverStep = IdentityHoc(QuickRecover)
export default Translate(withStyles(styles)(IdentityQuickRecoverStep))
