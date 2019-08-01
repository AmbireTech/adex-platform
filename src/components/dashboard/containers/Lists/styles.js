export const styles = theme => {
	const spacing = theme.spacing(1)
	// const iconButtonSize = 48 - (spacing * 2)
	return {
		controls: {
			display: 'flex',
			flexWrap: 'wrap',
			flexDirection: 'row',
		},
		flexRow: {
			display: 'flex',
			flexDirection: 'row',
			flexWrap: 'wrap',
		},
		flexItem: {
			marginRight: spacing,
			marginBottom: spacing,
		},
		rowButton: {
			marginTop: spacing * 1.5,
			// width: iconButtonSize,
			// height: iconButtonSize
		},
		rwoButtonRoot: {
			margin: spacing / 2,
		},
		row: {
			display: 'block'
		},
		bottomControls: {
			justifyContent: 'flex-start'
		},
		listRoot: {
			paddingBottom: spacing * 1.5,
			overflowX: 'auto',
		},
		controlsRoot: {
			padding: spacing * 1.5,
			paddingBottom: spacing * 0.5,
			// marginBottom: spacing * 2
		},
		pageSize: {
			width: '100px'
		}
	}
}
