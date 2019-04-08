export const styles = theme => {
	const spacing = theme.spacing.unit
	return {
		signinContainer: {
			overflowX: 'hidden',
			overflowY: 'auto',
			minHeight: '100vh',
			backgroundRepeat: 'no-repeat',
			backgroundSize: 'cover',
			backgroundPosition: 'center',
			position: 'relative'
		},
		container: {
			position: 'absolute',
			left: 0,
			top: 0,
			right: 0,
			bottom: 0,
		},
		adxVersion: {
			position: 'absolute',
			left: spacing,
			bottom: spacing
		},
		adexLogoTop: {
			textAlign: 'center'
		},
		logo: {
			marginTop: '1.5vh',
			width: '17.92vh',
			height: '6vh'
		},
		formControl: {
			display: 'flex'
		},
		buttonProgressWrapper: {
			margin: spacing,
			position: 'relative',
		},
		buttonProgress: {
			position: 'absolute',
			top: '50%',
			left: '50%',
			marginTop: -12,
			marginLeft: -12,
		},
		infoPaper: {
			...theme.mixins.gutters(),
			paddingTop: spacing * 2,
			paddingBottom: spacing * 2,
		}
	}
}