import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import Logo from 'components/common/icons/AdexIconTxt'
import Typography from '@material-ui/core/Typography'
import Anchor from 'components/common/anchor/anchor'
import SNT_VITALIK_BUTERIN_RIDES_EDDIE_WHILE_PUMPING_IT_UP from 'resources/eddie/eddie-14.png'

const useStyles = makeStyles(theme => ({
	root: {
		textAlign: 'center',
	},
	vitalik: {
		backgroundImage: `url(${SNT_VITALIK_BUTERIN_RIDES_EDDIE_WHILE_PUMPING_IT_UP})`,
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundSize: 'contain',
	},
	container: {
		maxWidth: theme.breakpoints.values.md,
		margin: 'auto',
	},
	logo: {
		height: '4rem',
		width: '100%',
	},
}))

export default function Home({ t, ...rest }) {
	const classes = useStyles()

	return (
		<Box
			width={1}
			height={1}
			className={classes.root}
			alignItems='center'
			justifyContent='center'
		>
			<Box
				className={classes.container}
				display='flex'
				flexDirection='row'
				alignItems='center'
				justifyContent='space-evenly'
				flexWrap='wrap'
			>
				<Box p={2}>
					<Anchor
						color='primary'
						className={classes.adxLink}
						target='_blank'
						href='https://www.adex.network/publishers'
					>
						{t('LINK_BENEFITS_FOR_PUBLISHERS')}
					</Anchor>
				</Box>
				<Box p={2}>
					<Anchor
						color='primary'
						className={classes.adxLink}
						target='_blank'
						href='https://www.adex.network'
					>
						{t('LINK_ADEX_HOME')}
					</Anchor>
				</Box>
				<Box p={2}>
					<Anchor
						color='primary'
						className={classes.adxLink}
						target='_blank'
						href='https://www.adex.network/for-advertisers'
					>
						{t('LINK_BENEFITS_FOR_PUBLISHERS')}
					</Anchor>
				</Box>
			</Box>
			<Box
				height={1}
				display='flex'
				flexDirection='column'
				alignItems='center'
				justifyContent='center'
				maxWidth='md'
				className={classes.container}
			>
				<Box p={2}>
					<Logo className={classes.logo} />
				</Box>

				{/* <Box p={2}>
					<Typography variant='h2' gutterBottom>
						{t('FUTURE_OF_THE_ADS')}
					</Typography>
				</Box>
				<Box p={1}>
					<Typography variant='body1' gutterBottom>
						{t('FUTURE_OF_THE_ADS_INFO_1')}
					</Typography>

					<Typography variant='body1' gutterBottom>
						{t('FUTURE_OF_THE_ADS_INFO_2')}
					</Typography>

					<Typography variant='body1' gutterBottom>
						{t('FUTURE_OF_THE_ADS_INFO_3')}
					</Typography>
				</Box> */}
				<Box p={2}>
					<Typography variant='h2' gutterBottom>
						{t('HOME_TITLE')}
					</Typography>
				</Box>
				<Box p={2}>
					<Typography variant='h3' gutterBottom>
						{t('HOME_SUBTITLE')}
					</Typography>
				</Box>
				<Box p={1}>
					<Typography variant='h6' component='h6' gutterBottom>
						{t('GET_IN_TOUCH')}
					</Typography>
				</Box>
				<Box
					height='30%'
					position='relative'
					className={classes.vitalik}
					alignSelf='stretch'
				></Box>
			</Box>
		</Box>
	)
}
