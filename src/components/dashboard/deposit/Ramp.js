import React from 'react'
import {
	Box,
	Typography,
	Button,
	List,
	ListItem,
	Grid,
} from '@material-ui/core'
import { t } from 'selectors'
import { makeStyles } from '@material-ui/core/styles'
import Img from 'components/common/img/Img'
import {
	openWyre,
	openPayTrie,
	openOnRampNetwork,
	openTransak,
} from 'services/onramp'
import RAMP_LOGO from 'resources/ramp.svg'
import WYRE_LOGO from 'resources/wyre.svg'
import PAYTRIE_LOGO from 'resources/paytrie.svg'
import TRANSAK_LOGO from 'resources/transak.svg'
import CHANGELLY_LOGO from 'resources/changelly.svg'
import { styles } from './styles'
import { push } from 'connected-react-router'
import { execute } from 'actions'

const useStyles = makeStyles(styles)

const fiatProvidersDetails = [
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
	{
		title: t('BANK_TRANSFER'),
		onClick: props => openTransak(props),
		imgSrc: TRANSAK_LOGO,
		imgAlt: t('TRANSAK'),
		feeInfo: t('TRANSAK_FEES'),
		limitInfo: t('TRANSAK_LIMITS'),
		currencies: t('TRANSAK_CURRENCIES'),
	},
]

const cryptoProvidersDetails = [
	{
		title: t('BITCOIN_TRANSFER'),
		onClick: ({ side }) => execute(push(`/dashboard/${side}/topup/btc`)),
		imgSrc: CHANGELLY_LOGO,
		imgAlt: t('CHANGELLY'),
		feeInfo: t('CHANGELLY_FEES'),
		limitInfo: t('CHANGELLY_LIMITS'),
		currencies: t('CHANGELLY_CURRENCIES'),
	},
]

const ProviderListItem = ({
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

const Providers = ({ providersDetails, accountId, symbol, email, side }) => (
	<List disablePadding>
		{providersDetails.map((item, key) => (
			<ListItem
				disableGutters
				key={key}
				onClick={() => item.onClick({ accountId, symbol, email, side })}
			>
				<ProviderListItem
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
)

export const FiatProviders = ({ accountId, symbol, email }) => (
	<Providers
		providersDetails={fiatProvidersDetails}
		accountId={accountId}
		symbol={symbol}
		email={email}
	/>
)

export const CryptoProviders = ({ accountId, symbol, email, side }) => (
	<Providers
		providersDetails={cryptoProvidersDetails}
		accountId={accountId}
		symbol={symbol}
		email={email}
		side={side}
	/>
)
