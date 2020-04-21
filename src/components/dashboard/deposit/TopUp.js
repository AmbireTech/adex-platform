import React from 'react'
import {
	Box,
	Card,
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
		title: 'Credit Card',
		onClick: props => openWyre(props),
		imgSrc: WYRE_LOGO,
		imgAlt: 'Wyre',
		feeInfo: 'Fees: 1.5% + 30¢',
		limitInfo: 'Limits: $250/day',
		currencies: 'Currencies: USD',
	},
	{
		title: 'Bank Transfer',
		onClick: props => openOnRampNetwork(props),
		imgSrc: RAMP_LOGO,
		imgAlt: 'Ramp Network',
		feeInfo: 'Fees: 0% - 2.5%',
		limitInfo: 'Limits: 10,000EUR/m',
		currencies: 'Currencies: GBP,EUR',
	},
	{
		title: 'Bank Transfer',
		onClick: props => openPayTrie(props),
		imgSrc: PAYTRIE_LOGO,
		imgAlt: 'PayTrie',
		feeInfo: 'Fees: 1% (min. $2 CAD)',
		limitInfo: 'Limits: $2,000CAD/day',
		currencies: 'Currencies: CAD',
	},
]

export default function TopUp() {
	const classes = useStyles()
	const accountId = useSelector(selectAccountIdentityAddr)
	const { symbol } = useSelector(selectMainToken)
	const email = useSelector(selectEmail)

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
									{/* {t('DIRECT_DEPOSIT_EXPLAIN')} */}
									{`Send DAI to this address in order to fund your account directly.`}
								</Typography>
							</Box>
						</CardContent>
					</Box>
				</Card>
			</Box>
			<Box m={1} display='flex'>
				<Card>
					<Box p={2} className={classes.root}>
						<CardContent className={classes.content}>
							<Typography className={classes.title}>
								{t('FIAT CURRENCY')}
							</Typography>
							<Typography className={classes.subtitle} gutterBottom>
								{t('CREDIT CARD & BANK TRANSFER')}
							</Typography>
							<Box p={2}>
								<Typography align='center' component='p' color='textSecondary'>
									{/* {t('DIRECT_DEPOSIT_EXPLAIN')} */}
									{`Deposit with credit card to you account directly using one of our onramp partners`}
								</Typography>
							</Box>
						</CardContent>
						<CardActions className={classes.actions}>
							<List className={classes.listItem}>
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
				</Card>
			</Box>
			<Box m={1} display='flex'>
				<Card>
					<Box p={2} className={classes.root}>
						<CardContent className={classes.content}>
							<Typography className={classes.title}>{t('BTC')}</Typography>
							<Typography className={classes.subtitle} gutterBottom>
								{t('DIRECT DEPOSIT')}
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
								{t('COMMING SOONER OR LATER')}
							</Button>
						</CardActions>
					</Box>
				</Card>
			</Box>
		</Box>
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
			<Box p={1} maxWidth={'100%'}>
				<Grid
					container
					direction='row'
					justify='space-between'
					alignItems='center'
				>
					<Grid item xs={12} sm={6} lg={6}>
						<Img className={classes.img} alt={imgAlt} src={imgSrc} />
					</Grid>
					<Grid item xs={12} sm={6} lg={6} className={classes.infoGrid}>
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
