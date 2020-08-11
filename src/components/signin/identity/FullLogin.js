import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { push } from 'connected-react-router'
import Typography from '@material-ui/core/Typography'
import { execute, updateIdentity, updateOwnerIdentities } from 'actions'
import {
	selectSpinnerById,
	selectIdentity,
	t,
	selectSearchParams,
	selectRegistrationAllowed,
} from 'selectors'
import Dropdown from 'components/common/dropdown'
import { GETTING_OWNER_IDENTITIES, CREATING_SESSION } from 'constants/spinners'
import {
	ContentBox,
	ContentBody,
	FullContentMessage,
} from 'components/common/dialog/content'
import { WALLET_ACTIONS_MSGS } from 'constants/misc'

const getIdentitiesForDropdown = (ownerIdentities = []) =>
	ownerIdentities.map(id => {
		return {
			value: id.identity + '-' + id.privLevel,
			label: id.ens
				? t('IDENTITY_OPTION_DATA_ENS', {
						args: [`PRIV_${id.privLevel}_LABEL`, id.ens, id.identity],
				  })
				: t('IDENTITY_OPTION_DATA', {
						args: [`PRIV_${id.privLevel}_LABEL`, id.identity],
				  }),
		}
	})

function FullLogin(props) {
	const identity = useSelector(selectIdentity)
	const {
		walletAddr,
		wallet = {},
		ownerIdentities,
		identityContractAddress,
	} = identity
	const walletAddress = wallet.address || walletAddr
	const spinner = useSelector(state =>
		selectSpinnerById(state, GETTING_OWNER_IDENTITIES)
	)
	const sessionSpinner = useSelector(state =>
		selectSpinnerById(state, CREATING_SESSION)
	)

	const walletMsgs = WALLET_ACTIONS_MSGS[wallet.authType || 'default']

	const searchParams = useSelector(selectSearchParams)
	searchParams.set('step', '1')

	const search = searchParams.toString()

	const showRegistration = useSelector(selectRegistrationAllowed)

	useEffect(() => {
		execute(updateOwnerIdentities({ owner: walletAddress }))
		// We need it just once on mount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<ContentBox>
			{sessionSpinner ? (
				<FullContentMessage
					msgs={walletMsgs}
					spinner={true}
				></FullContentMessage>
			) : (
				<ContentBody>
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
										variant='outlined'
										label={t('SELECT_IDENTITY')}
										helperText={t('SELECT_IDENTITY_INFO')}
										onChange={val =>
											execute(updateIdentity('identityContractAddress', val))
										}
										source={getIdentitiesForDropdown(ownerIdentities)}
										value={identityContractAddress || ''}
										htmlId='label-identityContractAddress'
										fullWidth
										loading={!!spinner}
										noSrcLabel={t('NO_IDENTITIES_FOR_ADDR', {
											args: [walletAddress],
										})}
									/>
								</Grid>
								{showRegistration && (
									<Grid item xs={12}>
										<Button
											onClick={() => execute(push(`/signup/full?${search}`))}
										>
											{t('CREATE_NEW_IDENTITY_LINK')}
										</Button>
									</Grid>
								)}
							</Grid>
						</Grid>
					</Grid>
				</ContentBody>
			)}
		</ContentBox>
	)
}

export default FullLogin
