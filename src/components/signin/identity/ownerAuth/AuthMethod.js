import React from 'react'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'
import { selectLocationQuery } from 'selectors'
import AuthMetamask from './AuthMetamask'
import AuthTrezor from './AuthTrezor'

const useStyles = makeStyles(theme => {
	const spacing = theme.spacing(1)

	return {
		tabsContainer: {
			display: 'flex',
			flexGrow: 1,
			overflowY: 'auto',
			position: 'relative',
			margin: spacing,
		},
	}
})

function AuthMethod(props) {
	const classes = useStyles()
	const query = useSelector(selectLocationQuery)
	const method = query['external']

	return (
		<Grid container spacing={2} direction='row' alignContent='flex-start'>
			<Grid item xs={12} className={classes.tabsContainer}>
				{method === 'metamask' && <AuthMetamask {...props} />}
				{method === 'trezor' && <AuthTrezor {...props} />}
			</Grid>
		</Grid>
	)
}

export default AuthMethod
