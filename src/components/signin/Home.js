import React from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import Logo from 'resources/adex-logo-txt-sm.svg'
import LogoDark from 'resources/adex-logo-txt-dark-theme.svg'
import Typography from '@material-ui/core/Typography'
import Anchor from 'components/common/anchor/anchor'
import SNT_VITALIK_BUTERIN_RIDES_EDDIE_WHILE_PUMPING_IT_UP from 'resources/eddie/eddie-14.png'
import Media from 'components/common/media'
import { ExternalAnchor } from 'components/common/anchor/anchor'

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
		height: '5rem',
		width: '100%',
	},
	link: {
		color: theme.palette.primary.main,
	},
}))

export default function Home({ t, ...rest }) {
	const classes = useStyles()
	const theme = useTheme()

	const AdxIcon = theme.type === 'dark' ? LogoDark : Logo

	return (
		<Box
			width={1}
			height={1}
			className={classes.root}
			display='flex'
			flexDirection='column'
			alignItems='center'
			justifyContent='center'
		>
			{/* <Box
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
						href='https://www.adex.network/for-advertisers'
					>
						{t('LINK_BENEFITS_FOR_ADVERTISERS')}
					</Anchor>
				</Box>
			</Box> */}
			<Box
				flexGrow={1}
				display='flex'
				flexDirection='column'
				alignItems='center'
				justifyContent='center'
				maxWidth='md'
				className={classes.container}
			>
				<Box p={2}>
					{/* <AdxIcon className={classes.logo} /> */}
					<Media className={classes.logo} src={AdxIcon} />
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
						<Box fontWeight='fontWeightNormal' m={1}>
							{t(' The new AdEx platform is under coming soon!')}
						</Box>
					</Typography>
				</Box>
				<Box p={2}>
					<Typography variant='h4' gutterBottom>
						<Box fontWeight='fontWeightLight' m={1}>
							{/* {t('HOME_SUBTITLE')} */}
							Stay tuned for updates on our &nbsp;
							<ExternalAnchor
								href={`https://twitter.com/AmbireAdEx`}
								// color='info'
							>
								{t(' Twitter ')}
							</ExternalAnchor>
							&nbsp; and learn more about what's next &nbsp;
							<ExternalAnchor
								href={`https://blog.ambire.com/ambire-adex-2023-roadmap/`}
								// color='info'
							>
								{t(' here ')}
							</ExternalAnchor>
						</Box>
					</Typography>
				</Box>
				{/* <Box p={1}>
					<Typography variant='h6' component='h6' gutterBottom>
						{t('GET_IN_TOUCH')}
					</Typography>
				</Box> */}
				{/* <Box
					height='30%'
					position='relative'
					className={classes.vitalik}
					alignSelf='stretch'
				></Box> */}
			</Box>
		</Box>
	)
}
