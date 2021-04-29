export const styles = theme => {
	const spacing = theme.spacing(1)
	// const errColor = theme.palette.error.main
	return {
		root: {
			color: 'purple',
			'&$active': {
				color: 'green',
			},
		},
		active: {
			color: 'yellow',
		},
		stepperWrapper: {
			position: 'absolute',
			overflow: 'hidden',
			bottom: 0,
			left: 0,
			right: 0,
			top: 0,
		},
		pagePaper: {
			flex: '1 1 auto',
			overflowY: 'auto',
			overflowX: 'hidden',
			height: 0,
			padding: spacing,
			backgroundColor:
				theme.palette.background.stepperPaper || theme.palette.background.paper,
		},
		right: {
			textAlign: 'right',
			display: 'inline-block',
			width: '50%',
			'@media(max-width:475px)': {
				width: '86%',
			},
		},
		left: {
			display: 'inline-block',
			textAlign: 'left',
			width: '50%',
			'@media(max-width:475px)': {
				width: '14%',
			},
		},
		mobileStepper: {
			justifyContent: 'center',
		},
		buttonProgressWrapper: {
			marginLeft: spacing,
			position: 'relative',
		},
		buttonProgress: {
			position: 'absolute',
			top: '50%',
			left: '50%',
			marginTop: -12,
			marginLeft: -12,
		},
		stepperNavRoot: {
			borderRadius: theme.shape.borderRadius,
			padding: spacing,
		},
	}
}
