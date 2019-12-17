import React from 'react'
import { useSelector } from 'react-redux'
// import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { LoadingSection } from 'components/common/spinners'
// import { styles } from './styles'
import { t, selectIdentity, selectSpinnerById } from 'selectors'

// const useStyles = makeStyles(styles)

const QuickDeploy = ({ validateId }) => {
	// const classes = useStyles()
	const spinner = useSelector(state => selectSpinnerById(state, validateId))
	const identity = useSelector(selectIdentity)
	const { walletAddr, identityAddr } = identity

	return !!spinner ? (
		<LoadingSection>{t('LOADING')}</LoadingSection>
	) : (
		<Grid container spacing={2}>
			<Grid item sm={12}>
				<Typography paragraph variant='subtitle1'>
					{t('QUICK_WALLET_ADDRESS')}
					{' ' + walletAddr}
				</Typography>
				<Typography paragraph variant='body2'>
					{t('QUICK_WALLET_ADDRESS_INFO')}
				</Typography>
				<Typography paragraph variant='subtitle1'>
					{t('IDENTITY_ADDRESS_INFO', {
						args: [identityAddr],
					})}
				</Typography>
			</Grid>
		</Grid>
	)
}

export default QuickDeploy
