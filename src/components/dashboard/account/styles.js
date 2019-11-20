export const styles = theme => {
	const spacing = theme.spacing(1)
	return {
		actionBtn: {
			margin: spacing,
		},
		address: {
			wordWrap: 'break-word',
			wordBreak: 'break-all',
		},
		advancedList: {
			width: '100%',
		},
		extendedIcon: {
			marginRight: theme.spacing(1),
		},
	}
}
