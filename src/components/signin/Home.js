import React, { useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Img from 'components/common/img/Img'
import { execute, resetIdentity } from 'actions'
import ADEX_LOGO from 'resources/adex-logo-txt-sm.svg'
import SNT_VITALIK_BUTERIN_RIDES_EDDIE_WHILE_PUMPING_IT_UP from 'resources/eddie/eddie-20.png'

const useStyles = makeStyles(theme => ({
	root: {
		textAlign: 'center'
	},
	vitalik: {
		backgroundImage: `url(${SNT_VITALIK_BUTERIN_RIDES_EDDIE_WHILE_PUMPING_IT_UP})`,
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundSize: 'contain'
	},
	container: {
		maxWidth: theme.breakpoints.values.md,
		margin: 'auto'
	}
}))

export default function Home({ t, ...rest }) {

	const classes = useStyles()

	useEffect(() => {
		execute(resetIdentity())
	}, [])

	return (<Box
		width={1}
		height={1}
		className={classes.root}
		alignItems='center'
	>
		<Box
			height={1}
			display='flex'
			flexDirection='column'
			alignItems='center'
			justifyContent='center'
			maxWidth='md'
			className={classes.container}
		>

			<Typography
				variant='h6'
				component='h6'
				gutterBottom
			>
				{t('GET_IN_TOUCH')}
			</Typography>

			<Img
				src={ADEX_LOGO}
				alt='AdEx logo'
			/>
			<Typography
				variant='h5'
				component='h5'
				gutterBottom
			>
				{t('FUTURE_OF_THE_ADS')}
			</Typography>
			<Typography
				variant='body1'
				gutterBottom
			>
				{t('FUTURE_OF_THE_ADS_INFO_1')}
			</Typography>
			<Typography
				variant='body1'
				gutterBottom
			>
				{t('FUTURE_OF_THE_ADS_INFO_2')}
			</Typography>
			<Typography
				variant='body1'
				gutterBottom
			>
				{t('FUTURE_OF_THE_ADS_INFO_3')}
			</Typography>
			<Box
				height='30%'
				position='relative'
				className={classes.vitalik}
				alignSelf='stretch'
			>
			</Box>
		</Box>
	</Box>)
}