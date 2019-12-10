import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import IdentityHoc from './IdentityHoc'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { bigNumberify } from 'ethers/utils'
import { formatTokenAmount } from 'helpers/formatters'
import { execute, ownerIdentities as updateOwnerIdentities } from 'actions'
import { selectSpinnerById, t } from 'selectors'
import Dropdown from 'components/common/dropdown'

const getIdentitiesForDropdown = (ownerIdentities = [], t) =>
	ownerIdentities.map(id => {
		return {
			value: id.identity + '-' + id.privLevel,
			label: t('IDENTITY_OPTION_DATA', {
				args: [
					id.identity,
					id.privLevel,
					formatTokenAmount(bigNumberify(id.balanceDAI).toString(), 18, true),
					'SAI',
				],
			}),
		}
	})

function FullLogin(props) {
	const { identity, handleChange } = props
	const { wallet, ownerIdentities, identityContractAddress } = identity
	const { address } = wallet
	const spinner = useSelector(state =>
		selectSpinnerById(state, 'getting-owner-identities')
	)

	useEffect(() => {
		execute(updateOwnerIdentities({ owner: address }))
		// We need it just once on mount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<Grid
			container
			spacing={2}
			// direction='row'
			alignContent='space-between'
			alignItems='center'
		>
			<Grid item xs={12}>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<Typography variant='body2' color='primary' gutterBottom>
							{t('FULL_LOGIN_INFO')}
						</Typography>
					</Grid>
					<Grid item xs={12}>
						<Dropdown
							label={t('SELECT_IDENTITY')}
							helperText={t('SELECT_IDENTITY_INFO')}
							onChange={val => handleChange('identityContractAddress', val)}
							source={getIdentitiesForDropdown(ownerIdentities, t)}
							value={identityContractAddress || ''}
							htmlId='label-identityContractAddress'
							fullWidth
							loading={!!spinner}
							noSrcLabel={t('NO_IDENTITIES_FOR_ADDR', { args: [address] })}
						/>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	)
}

const IdentityFullLoginStep = IdentityHoc(FullLogin)
export default IdentityFullLoginStep
