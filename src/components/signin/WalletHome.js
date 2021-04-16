import React from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
// import Logo from 'components/common/icons/AdexIconTxt'
// import LogoDark from 'components/common/icons/AdexIconTxtDark'
// import Typography from '@material-ui/core/Typography'
// import Anchor from 'components/common/anchor/anchor'
import walletVideoBkgSrc from 'resources/wallet/wallet-login-video-background.mp4'

const useStyles = makeStyles(theme => ({
	root: {
		textAlign: 'center',
	},
	container: {
		position: 'absolute',
		right: 0,
		bottom: 0,
		top: 0,
		left: 0,
		maxWidth: theme.breakpoints.values.md,
		margin: 'auto',
	},
	logo: {
		height: '5rem',
		width: '100%',
	},
	videoOverlay: {
		'&::after': {
			content: '""',
			position: 'absolute',
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			background: 'black',
			opacity: 0.42,
		},
	},
	videoBackground: {
		position: 'absolute',
		objectFit: 'cover',
		width: '100%',
		height: '100%',
		top: 0,
		left: 0,
		filter: 'blur(4px)',
	},
}))

export default function Home({ t, ...rest }) {
	const classes = useStyles()
	// const theme = useTheme()

	// const AdxIcon = theme.type === 'dark' ? LogoDark : Logo

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
			<Box className={classes.videoOverlay}>
				<video className={classes.videoBackground} autoPlay muted loop>
					<source src={walletVideoBkgSrc} type='video/mp4' />
				</video>
			</Box>
			<Box
				className={classes.container}
				display='flex'
				flexDirection='row'
				alignItems='center'
				justifyContent='space-evenly'
				flexWrap='wrap'
			>
				{'WALLET HERE'}
			</Box>
		</Box>
	)
}
