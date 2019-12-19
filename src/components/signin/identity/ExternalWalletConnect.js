import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import FullLogin from './FullLogin'
import FullInfo from './FullInfo'

const useStyles = makeStyles(theme => ({
	button: {
		height: '50%',
		minHeight: theme.spacing(4),
	},
	container: {},
}))

export function ExternalConnect({ t, ...rest }) {
	const classes = useStyles()
	const [connectType, setConnectType] = useState('')

	return (
		<Grid container alignItems='stretch' className={classes.buttons}>
			<Grid
				item
				container
				direction='column'
				alignItems='stretch'
				justify='space-evenly'
			>
				{connectType !== 'create' && (
					<>
						<Box>
							<Typography variant='h5' gutterBottom>
								{t('SELECT_EXISTING_IDENTITY')}
							</Typography>
							<FullLogin {...rest} />
						</Box>
						<Grid
							container
							// alignItems='stretch'
							className={classes.buttons}
						>
							<Grid item xs={12}>
								<Button onClick={() => setConnectType('create')}>
									{t('CREATE_NEW_IDENTITY_LINK')}
								</Button>
							</Grid>
						</Grid>
					</>
				)}
				{connectType === 'create' && (
					<>
						<Typography variant='h5' gutterBottom>
							{t('CREATE_NEW_IDENTITY')}
						</Typography>
						<FullInfo {...rest} />
					</>
				)}
			</Grid>
		</Grid>
	)
}
