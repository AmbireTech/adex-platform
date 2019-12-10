import React from 'react'
import IdentityHoc from './IdentityHoc'
import { useSelector } from 'react-redux'
// import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
// import { styles } from './styles'
import { t, selectIdentity } from 'selectors'

// const useStyles = makeStyles(styles)

const QuickDeploy = props => {
	// const classes = useStyles()
	const { identity } = props //  useSelector(selectIdentity)
	const { walletAddr, identityAddr } = identity

	return (
		<div>
			<Grid container spacing={2}>
				<Grid item sm={12}>
					<Typography paragraph variant='subheading'>
						{t('QUICK_WALLET_ADDRESS')}
						{' ' + walletAddr}
					</Typography>
					<Typography paragraph variant='body2'>
						{t('QUICK_WALLET_ADDRESS_INFO')}
					</Typography>
					<Typography paragraph variant='subheading'>
						{t('IDENTITY_ADDRESS_INFO', {
							args: [identityAddr],
						})}
					</Typography>
				</Grid>
			</Grid>
		</div>
	)
}

export default IdentityHoc(QuickDeploy)
