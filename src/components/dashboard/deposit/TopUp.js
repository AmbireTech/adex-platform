import React from 'react'
import { Box, Paper, Typography, Button, Grid } from '@material-ui/core'
import { FileCopy, WarningRounded } from '@material-ui/icons'
import {
	t,
	selectAccountIdentityAddr,
	selectMainToken,
	selectEmail,
	selectSide,
} from 'selectors'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector } from 'react-redux'
import copy from 'copy-to-clipboard'
import { styles } from './styles'
import { execute, addToast } from 'actions'
import { FiatProviders, CryptoProviders } from './Ramp'
import ReactGA from 'react-ga'
import { useTheme } from '@material-ui/core/styles'

const useStyles = makeStyles(styles)

export default function TopUp() {
	const classes = useStyles()
	const theme = useTheme()
	const accountId = useSelector(selectAccountIdentityAddr)
	const { symbol } = useSelector(selectMainToken)
	const email = useSelector(selectEmail)
	const side = useSelector(selectSide)

	return (
		<Grid container spacing={2}>
			<Grid item lg={4} md={6} sm={6} xs={12}>
				<Paper variant='outlined' className={classes.paper}>
					<Box
						p={2}
						display='flex'
						flexDirection='column'
						// justifyContent='space-between'
						height={1}
					>
						<Box mb={2}>
							<Typography className={classes.title}>{t('DAI')}</Typography>
							<Typography className={classes.subtitle} gutterBottom>
								{t('DIRECT_DEPOSIT')}
							</Typography>
							<Box mt={2}>
								<Typography align='center' component='p' color='textSecondary'>
									{t('DAI_DIRECT_DEPOSIT_INFO')}
								</Typography>
							</Box>
						</Box>
						<Box>
							<Button
								onClick={() => {
									copy(accountId)
									ReactGA.event({
										action: 'account',
										category: 'top_up',
										label: 'direct',
									})
									execute(
										addToast({
											type: 'accept',
											label: t('COPIED_TO_CLIPBOARD'),
											timeout: 5000,
										})
									)
								}}
								className={classes.copyBtn}
								size='large'
								color='default'
								disableElevation
								fullWidth
								endIcon={<FileCopy fontSize='small' color='disabled' />}
							>
								{accountId}
							</Button>
						</Box>
						<Box mt={2} px={2} textAlign='center' justifyContent='center'>
							<Box pr={1} display='inline'>
								<WarningRounded
									fontSize='small'
									style={{
										color: theme.palette.warning.main,
										verticalAlign: 'text-bottom',
									}}
								/>
							</Box>
							<Typography
								align='center'
								component='span'
								color='error'
								dangerouslySetInnerHTML={{
									__html: t('DAI_DIRECT_DEPOSIT_WARNING_1'),
								}}
							/>
							<Typography
								align='center'
								component='span'
								style={{
									color: theme.palette.warning.dark,
								}}
							>
								{` ${t('DAI_DIRECT_DEPOSIT_WARNING_2')}`}
							</Typography>
						</Box>
					</Box>
				</Paper>
			</Grid>
			<Grid item lg={4} md={6} sm={6} xs={12}>
				<Paper variant='outlined' className={classes.paper}>
					<Box
						p={2}
						pb={1}
						display='flex'
						flexDirection='column'
						// justifyContent='space-between'
						height={1}
					>
						<Box mb={2}>
							<Typography className={classes.title}>
								{t('FIAT_CURRENCY')}
							</Typography>
							<Typography className={classes.subtitle} gutterBottom>
								{t('CREDIT_CARD_BANK_TRANSFER')}
							</Typography>
							<Box mt={2}>
								<Typography align='center' component='p' color='textSecondary'>
									{t('ONRAMP_INFO')}
								</Typography>
							</Box>
						</Box>
						<Box>
							<FiatProviders
								accountId={accountId}
								symbol={symbol}
								email={email}
							/>
						</Box>
					</Box>
				</Paper>
			</Grid>
			<Grid item lg={4} md={6} sm={6} xs={12}>
				<Paper variant='outlined' className={classes.paper}>
					<Box
						p={2}
						pb={1}
						display='flex'
						flexDirection='column'
						// justifyContent='space-between'
						height={1}
					>
						<Box mb={2}>
							<Typography className={classes.title}>
								{t('CRYPTO_CURRENCY_DEPOSIT')}
							</Typography>
							<Typography className={classes.subtitle} gutterBottom>
								{t('CRYPTO_EXCHANGE')}
							</Typography>
							<Box mt={2}>
								<Typography align='center' component='p' color='textSecondary'>
									{t('CRYPTO_CURRENCY_DEPOSIT_INFO')}
								</Typography>
							</Box>
						</Box>
						<Box>
							<CryptoProviders
								accountId={accountId}
								symbol={symbol}
								email={email}
								side={side}
							/>
						</Box>
					</Box>
				</Paper>
			</Grid>
		</Grid>
	)
}
