export const styles = theme => {
	const spacing = theme.spacing(1)
	return {
		itemActions: {
			display: 'flex',
			flex: '0 0 187px',
			flexDirection: 'column',
			alignItems: 'flex-end',
			justifyContent: 'space-around',
		},
		actionBtn: {
			marginBottom: spacing,
		},
		address: {
			wordWrap: 'break-word',
		},
		advancedList: {
			width: '100%',
		},
		extendedIcon: {
			marginRight: theme.spacing(1),
		},
	}
}
