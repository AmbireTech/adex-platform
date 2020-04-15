import React from 'react'
import {
	Box,
	Card,
	CardContent,
	Typography,
	CardActions,
	Button,
} from '@material-ui/core'
import { CreditCard } from '@material-ui/icons'
import { t, selectAccountIdentityAddr, selectAuthType } from 'selectors'
import { makeStyles } from '@material-ui/core/styles'
import Img from 'components/common/img/Img'
import { useSelector } from 'react-redux'
import copy from 'copy-to-clipboard'
import { formatAddress } from 'helpers/formatters'
import { getAuthLogo } from 'helpers/logosHelpers'
import { openWyre, openPayTrie } from 'services/onramp/index'

const useStyles = makeStyles({
	root: {
		maxWidth: 350,
		// minHeight: 300,
		height: '100%',
		flexGrow: 1,
		display: 'flex',
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'space-between',
	},
	badgeFull: {
		width: '100%',
	},
	copyBtn: {
		backgroundColor: '#E2EAED',
		borderRadius: '3px',
	},
	bullet: {
		display: 'inline-block',
		margin: '0 2px',
		transform: 'scale(0.8)',
	},
	authImg: {
		width: '1em',
		height: '1em',
		display: 'flex',
	},
	title: {
		fontSize: '2rem',
		textAlign: 'center',
	},
	subtitle: {
		fontSize: '1rem',
		textAlign: 'center',
	},
	pos: {
		marginBottom: 12,
	},
	actions: {
		display: 'flex',
		justifyContent: 'space-between',
	},
})

export default function TopUp() {
	const classes = useStyles()
	const accountId = useSelector(selectAccountIdentityAddr)
	const authType = useSelector(selectAuthType)
	const imgSrc = getAuthLogo(authType)
	return (
		<Box
			display='flex'
			flexWrap='wrap'
			flex='1'
			flexDirection='row'
			justifyContent='center'
		>
			<Box m={1} display='flex'>
				<Card>
					<Box p={2} className={classes.root}>
						<CardContent className={classes.content}>
							<Typography className={classes.title}>{t('DAI')}</Typography>
							<Typography className={classes.subtitle} gutterBottom>
								{t('DIRECT DEPOSIT')}
							</Typography>
							<Button
								className={classes.copyBtn}
								size='large'
								color='default'
								variant='contained'
								disableElevation
								fullWidth
							>
								{formatAddress(accountId)}
							</Button>
							<Box p={2}>
								<Typography align='center' component='p' color='textSecondary'>
									{/* {t('DIRECT_DEPOSIT_EXPLAIN')} */}
									{`The ETH address (Identity address) of the account labelled "DAI deposit address"`}
								</Typography>
							</Box>
						</CardContent>
						<CardActions className={classes.actions}>
							<Button
								startIcon={<Img className={classes.authImg} src={imgSrc} />}
								size='large'
								color='primary'
								variant='contained'
								fullWidth
							>
								{t('DEPOSIT_WITH_AUTH_METHOD')}
							</Button>
						</CardActions>
					</Box>
				</Card>
			</Box>
			<Box m={1} display='flex'>
				<Card>
					<Box p={2} className={classes.root}>
						<CardContent className={classes.content}>
							<Typography className={classes.title}>{t('FIAT')}</Typography>
							<Typography className={classes.subtitle} gutterBottom>
								{t('CREDIT CARD')}
							</Typography>
							<Box p={2}>
								<Typography align='center' component='p' color='textSecondary'>
									{/* {t('DIRECT_DEPOSIT_EXPLAIN')} */}
									{`Deposit with credit card to you account directly using one of our onramp partners`}
								</Typography>
							</Box>
						</CardContent>
						<CardActions className={classes.actions}>
							<Button
								size='large'
								startIcon={<CreditCard />}
								color='primary'
								onClick={() => openWyre({ dest: accountId })}
								variant='contained'
								fullWidth
							>
								{t('CREDIT_CARD_DEPOSIT')}
							</Button>
						</CardActions>
					</Box>
				</Card>
			</Box>
			<Box m={1} display='flex'>
				<Card>
					<Box p={2} className={classes.root}>
						<CardContent className={classes.content}>
							<Typography className={classes.title} gutterBottom>
								{t('BTC DEPOSIT')}
							</Typography>
							<Box p={2}>
								<Typography align='center' component='p' color='textSecondary'>
									{/* {t('DIRECT_DEPOSIT_EXPLAIN')} */}
									{`In the future you are going to be able to deposit with BTC as well`}
								</Typography>
							</Box>
						</CardContent>
						<CardActions className={classes.actions}>
							<Button
								size='large'
								color='primary'
								variant='contained'
								fullWidth
								disabled
							>
								{t('COMMING SOON')}
							</Button>
						</CardActions>
					</Box>
				</Card>
			</Box>
		</Box>
	)
}
