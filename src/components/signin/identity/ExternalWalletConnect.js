import React, { useState } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import FullLogin from './FullLogin'
import IdentityContractAddressEthDeploy from './IdentityContractAddressEthDeploy'

export function ExternalConnect(props) {

	const [connectType, setConnectType] = useState('')

	return (<Grid
		container
		spacing={2}
	>
		{!connectType &&
			<div>
				<Button
					variant='contained'
					color='primary'
					onClick={() => setConnectType('login')}
				>
					{props.t('USE_EXISTING_IDENTITY')}
				</Button>
				<Button
					variant='contained'
					color='secondary'
					onClick={() => setConnectType('create')}
				>
					{props.t('CREATE_NEW_IDENTITY')}
				</Button>
			</div>
		}
		{
			connectType === 'login' &&
			<div>
				<h3>Select existing identity</h3>
				<FullLogin {...props} />
			</div>
		}
		{
			connectType === 'create' &&
			<div>
				<h3>Create new identity</h3>
				<IdentityContractAddressEthDeploy {...props} />
			</div>
		}
	</Grid>)
}