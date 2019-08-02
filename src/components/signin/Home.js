import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Img from 'components/common/img/Img'

import ADEX_LOGO from 'resources/adex-logo-txt-sm.svg'
import SNT_VITALIK_BUTERIN_RIDES_EDDIE_WHILE_PUMPING from 'resources/eddie/eddie-20.png'

const useStyles = makeStyles(theme => ({
	root: {
		textAlign: 'center'
	},
	vitalik : {
		backgroundImage: `url(${SNT_VITALIK_BUTERIN_RIDES_EDDIE_WHILE_PUMPING})`,
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundSize: 'contain'
	}
}))

export default function Home({ t, ...rest }) {

	const classes = useStyles()

	return (<Box
		width={1}
		height={1}
		className={classes.root}
	>
		<Box
			height='70%'
			display='flex'
			flexDirection='column'
			alignItems='center'
			justifyContent='center'
		>
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
		</Box>
		<Box
			height='30%'
			position='relative'
			className={classes.vitalik}
		>
		</Box>
	</Box>)
}