import React, { Component } from 'react'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

const RRButton = withReactRouterLink(Button)

const AuthCard = ({
	authPoints = [],
	title,
	disabled,
	classes,
	toCreate,
	toLogin,
	btnCreateTitle,
	btnLoginTitle,
	linkTitle,
	...other }) => (
	<Card className={classes.card} raised>
		<CardContent>
			<Typography
				variant='h4'
				color='primary'
				gutterBottom
			>
				{title}
			</Typography>
			{authPoints.map((point, index) =>
				<Typography
					key={index}
					variant='subtitle1'
				>
					{point}
				</Typography>
			)}
		</CardContent>
		<CardActions className={classes.actions}>
			{btnCreateTitle && <RRButton
				variant='contained'
				to={toCreate}
				size='large'
				color='primary'
				disabled={disabled}
			>
				{btnCreateTitle}
			</RRButton>}
			{btnLoginTitle && <RRButton
				variant='contained'
				to={toLogin}
				size='large'
				color='primary'
				disabled={disabled}
			>
				{btnLoginTitle}
			</RRButton>}
		</CardActions>
	</Card>
)

class AuthSelect extends Component {
	componentDidMount() {
		// NOTE: reset identity if someone press backspace 
		// to go to this page
		this.props.actions.resetIdentity()
	}

	render() {
		let { t, classes } = this.props
		return (
			<Grid
				container
				spacing={16}
				alignItems='center'
			>
				<Grid item xs={12}>
					<Typography variant="h6" gutterBottom>
						{t('GET_IN_TOUCH')}
					</Typography>
					<Typography variant="h6" gutterBottom>
						{'contactus@adex.network'}
					</Typography>
				</Grid>

				<Grid item xs={12} md={6}>
					<AuthCard
						classes={classes}
						title={t('GRANT_ACCOUNT')}
						authPoints={[
							t('GRANT_ACCOUNT_INFO_1'),
							t('GRANT_ACCOUNT_INFO_2'),
							t('GRANT_ACCOUNT_INFO_3'),
							t('GRANT_ACCOUNT_INFO_4')
						]}
						toCreate='/identity/grant'
						toLogin='/login/grant'
						btnCreateTitle={t('CREATE_GRANT_ACCOUNT')}
						btnLoginTitle={t('LOGIN_GRANT_ACCOUNT')}
					/>
				</Grid>

				<Grid item xs={12} md={6}>
					<AuthCard
						classes={classes}
						title={t('FULL_ACCOUNT')}
						authPoints={[
							t('FULL_ACCOUNT_INFO_1'),
							t('FULL_ACCOUNT_INFO_2'),
							t('FULL_ACCOUNT_INFO_3'),
							t('FULL_ACCOUNT_INFO_4')
						]}
						toCreate='/identity/full'
						toLogin='/login/full'
						btnCreateTitle={t('CREATE_FULL_ACCOUNT')}
						btnLoginTitle={t('LOGIN_FULL_ACCOUNT')}
					/>
				</Grid>

				{/* <Grid item xs={12} md={4}>
						<AuthCard
							disabled
							classes={classes}
							title={t('DEMO_ACCOUNT')}
							authPoints={[
								t('DEMO_ACCOUNT_INFO_1'),
								t('DEMO_ACCOUNT_INFO_2'),
								t('DEMO_ACCOUNT_INFO_3'),
								t('DEMO_ACCOUNT_INFO_4')
							]}
							toCreate='/identity/demo'
							btnCreateTitle={t('GO_DEMO_ACCOUNT')}
						/>
					</Grid> */}

			</Grid>
		)
	}
}

export default Translate(withStyles(styles)(AuthSelect))
