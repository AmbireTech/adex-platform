import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import FullLogin from './FullLogin'
import IdentityContractAddressEthDeploy from './IdentityContractAddressEthDeploy'

const useStyles = makeStyles(theme => ({
	button: {
		height: '50%',
		minHeight: theme.spacing(4)
	}
}))

export function ExternalConnect({ t, ...rest }) {

	const classes = useStyles()
	const [connectType, setConnectType] = useState('')

	return (<Box
		width={1}
		height={1}
	>
		{!connectType &&
			<Box
				width={1}
				height={1}
				display='flex'
			>
				<Grid
					container
					spacing={2}
					alignItems='stretch'
				>
					<Grid
						item
						container
						xs={12}
						sm={6}
						alignItems='center'
					>
						<Button
							className={classes.button}
							variant='contained'
							color='default'
							onClick={() => setConnectType('login')}
							fullWidth
						>
							{t('USE_EXISTING_IDENTITY')}
						</Button>
					</Grid>
					<Grid
						item
						container
						xs={12}
						sm={6}
						alignItems='center'
					>
						<Button
							className={classes.button}
							variant='contained'
							color='primary'
							contrast
							onClick={() => setConnectType('create')}
							fullWidth

						>
							{t('CREATE_NEW_IDENTITY')}
						</Button>
					</Grid>
				</Grid>
			</Box>
		}
		{
			connectType === 'login' &&
			<div>
				<h3>{t('SELECT_EXISTING_IDENTITY')}</h3>
				<FullLogin {...rest} />
			</div>
		}
		{
			connectType === 'create' &&
			<div>
				<h3>{t('CREATE_NEW_IDENTITY')}</h3>
				<IdentityContractAddressEthDeploy {...rest} />
			</div>
		}
	</Box>)
}