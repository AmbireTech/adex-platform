export const styles = theme => {
	const spacing = theme.spacing.unit
	return {
		snackbar: {
			border: '3px solid',
			borderRadius: 0,
			backgroundColor: '#222',
			'&.active': {
				transform: 'translateY(-20%)'
			},
			margin: spacing
		},
		warning: {
			borderColor: '#FFAB00',
			color: '#FFAB00'
		},
		cancel: {
			borderColor: '#FF5722',
			color: '#FF5722'
		},
		accept: {
			borderColor: '#00E676',
			color: '#00E676'
		},
		icon: {
			fontSize: 20,
		},
		iconVariant: {
			opacity: 0.9,
			marginRight: theme.spacing.unit,
		},
		message: {
			display: 'flex',
			alignItems: 'center',
		},
		top: {
			width: '98vw',
			maxWidth: '98vw'
		}
	}
}