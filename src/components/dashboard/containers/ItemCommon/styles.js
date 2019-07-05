export const styles = theme => {
	const spacing = theme.spacing.unit * 1
	const aspect = '56.25%'

	return {
		card: {
			marginRight: spacing,
			marginBottom: spacing,
			width: 320,
			display: 'block',
			position: 'relative',
			maxWidth: '100%',
			'@media(max-width:380px)': {
				margin: 0,
				marginBottom: spacing,
			}
		},
		mediaRoot: {
			height: 0,
			paddingTop: aspect, // 16:9
			position: 'relative',
			overflow: 'hidden'
		},
		img: {
			position: 'absolute',
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,
			margin: 'auto',
			// minWidth: '50%',
			// minHeight: '50%',
			height: 'auto',
			maxWidth: '100%',
			width: 'auto',
			maxHeight: '100%'
		},
		basicInfo: {
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'start',
			flexWrap: 'wrap'
		},
		buttonRight: {
			marginLeft: spacing
		},
		error: {
			color: theme.palette.error.main
		},
		label: {
			marginBottom: spacing,
			color: theme.palette.text.hint
		},
		editIcon: {
			position: 'absolute',
			marginTop: `calc(56.25% - ${40 + spacing}px)`,
			top: 0,
			right: spacing
		}
	}
}