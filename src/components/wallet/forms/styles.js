export const styles = theme => {
	// const spacing = theme.spacing(1)
	return {
		error: {
			color: theme.palette.error.main,
		},
		warning: {
			color: theme.palette.warning.A700,
		},
		centralSpinner: {
			position: 'absolute',
			left: 'calc(50% - 20px)',
			top: ' calc(50% - 20px)',
		},
		imgPreview: {
			height: 120,
			width: 'auto',
			maxWidth: '100%',
			boxShadow: theme.shadows[2],
		},
	}
}
