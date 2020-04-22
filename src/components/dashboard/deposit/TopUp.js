import React from 'react'
import {
	Box,
	Paper,
	CardContent,
	Typography,
	CardActions,
	Button,
	List,
	ListItem,
	Grid,
} from '@material-ui/core'
import { FileCopy } from '@material-ui/icons'
import {
	t,
	selectAccountIdentityAddr,
	selectMainToken,
	selectEmail,
} from 'selectors'
import { makeStyles } from '@material-ui/core/styles'
import Img from 'components/common/img/Img'
import { useSelector } from 'react-redux'
import copy from 'copy-to-clipboard'
import { openWyre, openPayTrie, openOnRampNetwork } from 'services/onramp'
import RAMP_LOGO from 'resources/ramp.svg'
import WYRE_LOGO from 'resources/wyre.svg'
import PAYTRIE_LOGO from 'resources/paytrie.svg'
import { styles } from './styles'
import { execute, addToast } from 'actions'

const useStyles = makeStyles(styles)
const onRampProvidersDetails = [
	{
		title: t('CREDIT_CARD'),
		onClick: props => openWyre(props),
		imgSrc: WYRE_LOGO,
		imgAlt: t('WYRE'),
		feeInfo: t('WYRE_FEES'),
		limitInfo: t('WYRE_LIMITS'),
		currencies: t('WYRE_CURRENCIES'),
	},
	{
		title: t('BANK_TRANSFER'),
		onClick: props => openOnRampNetwork(props),
		imgSrc: RAMP_LOGO,
		imgAlt: t('RAMP'),
		feeInfo: t('RAMP_FEES'),
		limitInfo: t('RAMP_LIMITS'),
		currencies: t('RAMP_CURRENCIES'),
	},
	{
		title: t('BANK_TRANSFER'),
		onClick: props => openPayTrie(props),
		imgSrc: PAYTRIE_LOGO,
		imgAlt: t('PAYTRIE'),
		feeInfo: t('PAYTRIE_FEES'),
		limitInfo: t('PAYTRIE_LIMITS'),
		currencies: t('PAYTRIE_CURRENCIES'),
	},
]

export default function TopUp() {
	const classes = useStyles()
	const accountId = useSelector(selectAccountIdentityAddr)
	const { symbol } = useSelector(selectMainToken)
	const email = useSelector(selectEmail)

	return (
		<Grid container spacing={2}>
			<Grid item lg={4} md={6} sm={12}>
				<Paper variant='outlined' className={classes.paper}>
					<Box
						p={2}
						display='flex'
						flexDirection='column'
						justifyContent='space-between'
						height='100%'
					>
						<CardContent>
							<Typography className={classes.title}>{t('DAI')}</Typography>
							<Typography className={classes.subtitle} gutterBottom>
								{t('DIRECT_DEPOSIT')}
							</Typography>
							<Button
								onClick={() => {
									copy(accountId)
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
								variant='contained'
								disableElevation
								fullWidth
								endIcon={<FileCopy fontSize='small' color='disabled' />}
							>
								{accountId}
							</Button>
							<Box p={2}>
								<Typography align='center' component='p' color='textSecondary'>
									{t('DAI_DIRECT_DEPOSIT_INFO')}
								</Typography>
							</Box>
						</CardContent>
					</Box>
				</Paper>
			</Grid>
			<Grid item lg={4} md={6} sm={12} direction='row' alignItems='stretch'>
				<Paper variant='outlined' className={classes.paper}>
					<Box
						p={2}
						display='flex'
						flexDirection='column'
						justifyContent='space-between'
						height='100%'
					>
						<CardContent>
							<Typography className={classes.title}>
								{t('FIAT_CURRENCY')}
							</Typography>
							<Typography className={classes.subtitle} gutterBottom>
								{t('CREDIT_CARD_BANK_TRANSFER')}
							</Typography>
							<Box p={2}>
								<Typography align='center' component='p' color='textSecondary'>
									{t('ONRAMP_INFO')}
								</Typography>
							</Box>
						</CardContent>
						<CardActions>
							<List>
								{onRampProvidersDetails.map((item, key) => (
									<ListItem
										key={key}
										onClick={() => item.onClick({ accountId, symbol, email })}
									>
										<OnRampListItem
											key={key}
											title={item.title}
											imgSrc={item.imgSrc}
											imgAlt={item.imgAlt}
											feeInfo={item.feeInfo}
											limitInfo={item.limitInfo}
											currencies={item.currencies}
										/>
									</ListItem>
								))}
							</List>
						</CardActions>
					</Box>
				</Paper>
			</Grid>
			<Grid item lg={4} md={6} sm={12} alignItems='stretch'>
				<Paper variant='outlined' className={classes.paper}>
					<Box
						p={2}
						display='flex'
						flexDirection='column'
						justifyContent='space-between'
						height='100%'
					>
						<CardContent>
							<Typography className={classes.title}>{t('BTC')}</Typography>
							<Typography className={classes.subtitle} gutterBottom>
								{t('DIRECT_DEPOSIT')}
							</Typography>
							<Box p={2}>
								<Typography align='center' component='p' color='textSecondary'>
									{t('BTC_INFO')}
								</Typography>
							</Box>
						</CardContent>
						<CardActions>
							<Button
								size='large'
								color='primary'
								variant='contained'
								fullWidth
								disabled
							>
								{t('COMMING_SOON')}
							</Button>
						</CardActions>
					</Box>
				</Paper>
			</Grid>
		</Grid>
	)
}

const OnRampListItem = ({
	imgSrc,
	imgAlt,
	title,
	feeInfo,
	limitInfo,
	currencies,
}) => {
	const classes = useStyles()
	return (
		<Button size='large' fullWidth disableElevation className={classes.copyBtn}>
			<Box p={1} width='100%'>
				<Grid
					container
					direction='row'
					justify='space-between'
					alignItems='center'
				>
					<Grid item xs={12} sm={4} md={4}>
						<Img className={classes.img} alt={imgAlt} src={imgSrc} />
					</Grid>
					<Grid item xs={12} sm={8} md={8} className={classes.infoGrid}>
						<Typography className={classes.infoTitle}>{title}</Typography>
						{[feeInfo, limitInfo, currencies].map((item, key) => (
							<Typography
								key={`info-${key}`}
								className={classes.info}
								component='p'
								color='textSecondary'
							>
								{item}
							</Typography>
						))}
					</Grid>
				</Grid>
			</Box>
		</Button>
	)
}
