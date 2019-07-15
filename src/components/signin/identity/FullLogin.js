import React, { Component } from 'react'
import IdentityHoc from './IdentityHoc'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Translate from 'components/translate/Translate'
import { bigNumberify } from 'ethers/utils'
import { formatTokenAmount } from 'helpers/formatters'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

import Dropdown from 'components/common/dropdown'

const getIdentitiesForDropdown = (ownerIdentities, t) =>
	ownerIdentities.map(id => {
		return {
			value: id.identity + '-' + id.privLevel,
			label: t('IDENTITY_OPTION_DATA',
				{
					args: [
						id.identity,
						id.privLevel,
						formatTokenAmount(bigNumberify(id.balanceDAI).toString(), 18, true),
						'DAI'
					]
				})
		}
	})

class GrantLogin extends Component {
	componentDidMount() {
		const { actions, identity } = this.props
		actions.ownerIdentities({ owner: identity.wallet.address })
		this.validateIdentity(false)
	}

	validateIdentity = (dirty) => {
		const { identity, handleChange, validate } = this.props
		const { wallet, identityContractAddress } = identity

		const identityDataSplit = (identityContractAddress || '').split('-')
		const identityData = {
			address: identityDataSplit[0],
			privileges: parseInt(identityDataSplit[1] || 0)
		}

		handleChange('wallet', wallet)
		handleChange('walletAddr', wallet.address)
		handleChange('identityData', identityData)

		validate('identityContractAddress', {
			isValid: !!identityData.address,
			err: { msg: 'ERR_LOCAL_WALLET_LOGIN' },
			dirty: dirty
		})
	}

	componentDidUpdate(prevProps) {
		if (prevProps.identity.identityContractAddress !==
			this.props.identity.identityContractAddress) {
			this.validateIdentity(true)
		}
	}

	render() {
		const { t, identity, handleChange } = this.props
		const { ownerIdentities = [], identityContractAddress } = identity

		return (
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
								onChange={(val) => handleChange('identityContractAddress', val)}
								source={getIdentitiesForDropdown(ownerIdentities, t)}
								value={identityContractAddress || ''}
								htmlId='label-identityContractAddress'
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