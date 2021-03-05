import React from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
// import Logo from 'components/common/icons/AdexIconTxt'
// import LogoDark from 'components/common/icons/AdexIconTxtDark'
// import Typography from '@material-ui/core/Typography'
// import Anchor from 'components/common/anchor/anchor'
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
		height: '5rem',
		width: '100%',
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
