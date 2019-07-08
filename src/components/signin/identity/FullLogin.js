import React, { Component } from 'react'
import IdentityHoc from './IdentityHoc'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

import Dropdown from 'components/common/dropdown'

class GrantLogin extends Component {
	componentDidMount() {
		const { actions, identity } = this.props
		actions.ownerIdentities({ owner: identity.wallet.address })
		this.validateIdentity(false)
	}

	validateIdentity = (dirty) => {
		const { identity, handleChange, validate } = this.props
		const { ownerIdentities, wallet, identityContractOwner } = identity

		validate('identityContractOwner', {
			isValid: !!identityContractOwner,
			err: { msg: 'ERR_LOCAL_WALLET_LOGIN' },
			dirty: dirty
		})
	}

	render() {
		const { t, identity, handleChange, invalidFields, classes, actions } = this.props
		const { ownerIdentities = [], identityContractOwner } = identity
		// Errors
		const { wallet } = invalidFields
		return (
			// <div>
			<Grid
				container
				spacing={16}
				// direction='row'
				alignContent='space-between'
				alignItems='center'
			>
				<Grid item xs={12}>
					<Grid
						container
						spacing={16}
					>
						<Grid item xs={12}>
							<Typography variant='body2' color='primary' gutterBottom>
								{t('FULL_LOGIN_INFO')}
							</Typography>
						</Grid>
						<Grid item xs={12}>
							<Dropdown
								label={t('SELECT_IDENTITY')}
								helperText={t('SELECT_IDENTITY_INFO')}
								onChange={(val) => handleChange(identityContractOwner, val)}
								source={ownerIdentities.map(i => { return { value: i, label: i } })}
								value={identityContractOwner || ''}
								htmlId='label-identityContractOwner'
								fullWidth
							/>

						</Grid>

					</Grid>

				</Grid>
			</Grid>
			// </div>
		)
	}
}

const IdentityGrantLoginStep = IdentityHoc(GrantLogin)
export default Translate(withStyles(styles)(IdentityGrantLoginStep))