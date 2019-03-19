import React, { Component } from 'react'
// import PublisherLogo from 'components/common/icons/AdexPublisher'
// import AdvertiserLogo from 'components/common/icons/AdexAdvertiser'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import Translate from 'components/translate/Translate'
import classnames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'


const RRButton = withReactRouterLink(Button)


const AuthCard = ({ authPoints = [], title, disabled, classes, to, linkTitle, ...other }) => (
	<Card className={classes.card}>
		<CardContent>
			<Typography component='h2' variant='headline' color='primary' gutterBottom>
				{title}
			</Typography>
			{authPoints.map((point, index) =>
				<Typography key={index} component='h5'>
					{point}
				</Typography>
			)}
		</CardContent>
		<CardActions>
			<RRButton
				variant='contained'
				to={to} size='medium'
				color='primary'
			>
				{linkTitle}
			</RRButton>
		</CardActions>
	</Card>
)

class AuthSelect extends Component {

	render() {
		let { t, classes } = this.props
		return (
			<Dialog
				open={true}
				classes={{ paper: classes.dialogPaper }}
				BackdropProps={{
					classes: {
						root: classes.backdrop
					}
				}}
				fullWidth
				maxWidth='md'
			>
				<DialogTitle >
					{t('CHOOSE_ACCOUNT_TYPE')}
				</DialogTitle>
				<DialogContent>

					<Grid container className={classes.flexGrow} spacing={16}>

						<Grid item xs={12} md={4}>
							<AuthCard
								classes={classes}
								title={t('QUICK_ACCOUNT')}
								authPoints={[t('QUICK_ACCUNT_INFO_1'), t('QUICK_ACCUNT_INFO_2'), t('QUICK_ACCUNT_INFO_2')]}
								to='/identity/quick'
								linkTitle={t('GO_QUICK_ACCOUNT')}
							/>
						</Grid>

						<Grid item xs={12} md={4}>
							<AuthCard
								classes={classes}
								title={t('FULL_ACCOUNT')}
								authPoints={[t('FULL_ACCOUNT_INFO_1'), t('FULL_ACCOUNT_INFO_2'), t('FULL_ACCOUNT_INFO_3'), t('FULL_ACCOUNT_INFO_4')]}
								to='/identity/full'
								linkTitle={t('GO_FULL_ACCOUNT')}
							/>
						</Grid>

						<Grid item xs={12} md={4}>
							<AuthCard
								classes={classes}
								title={t('DEMO_ACCOUNT')}
								authPoints={[t('DEMO_ACCOUNT_INFO_1'), t('DEMO_ACCOUNT_INFO_2'), t('DEMO_ACCOUNT_INFO_3')]}
								to='/identity/demo'
								linkTitle={t('GO_DEMO_ACCOUNT')}
							/>
						</Grid>

					</Grid>
				</DialogContent>
			</Dialog>
		)
	}
}

export default Translate(withStyles(styles)(AuthSelect))
