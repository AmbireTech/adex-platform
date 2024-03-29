export const styles = theme => {
	const spacing = theme.spacing(1)
	return {
		root: {
			// flexGrow: 1,
			height: '100vh',
			paddingTop: 74,
		},
		signinContainer: {
			overflowX: 'hidden',
			overflowY: 'auto',
			minHeight: '100vh',
			backgroundRepeat: 'no-repeat',
			backgroundSize: 'cover',
			backgroundPosition: 'center',
			position: 'relative',
		},
		container: {
			height: '100%',
			flexGrow: '1',
		},
		actions: {
			backgroundImage: `url(${require('resources/home-wallpaper.png')})`,
			backgroundRepeat: 'no-repeat',
			backgroundSize: 'cover',
			backgroundPosition: 'center',
			backgroundColor: theme.palette.background.paper,
		},
		buttons: {
			backgroundColor: theme.palette.grey[200],
		},
		adxVersion: {
			// position: 'absolute',
			// left: spacing,
			// bottom: spacing
		},
		adexLogoTop: {
			textAlign: 'center',
		},
		logo: {
			// marginTop: '1.5vh',
			// width: '17.92vh',
			// height: '6vh',
			height: '2rem',
		},
		dialogPaper: {
			height: '80vh',
			margin: spacing * 2,
		},
		noBg: {
			background: 0,
			boxShadow: 'none',
			overflow: 'visible',
		},
		backdrop: {
			backgroundColor: 'rgba(255, 255, 255, 0.5)',
		},
		content: {
			display: 'flex',
			flexDirection: 'column',
			flex: '1 1 auto',
			// position: 'relative',
			justifyContent: 'center',
			padding: 24,
			// margin: `${spacing}px ${spacing}px ${spacing}px ${spacing}px`,
			// '&:first-child': {
			// 	paddingTop: spacing,
			// },
			// overflow: 'visible',
			// maxHeight: '100vh'
		},
	}
}
