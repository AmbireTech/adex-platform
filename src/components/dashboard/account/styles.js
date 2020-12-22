export const styles = theme => {
	const spacing = theme.spacing(1)
	return {
		root: {
			flexGrow: 1,
		},
		actionBtn: {
			margin: spacing,
		},
		address: {
			wordWrap: 'break-word',
			wordBreak: 'break-all',
			flexGrow: 0,
		},
		advancedList: {
			width: '100%',
		},
		iconBtnLeft: {
			marginRight: theme.spacing(1),
		},
		infoLabel: {
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
		},
		extraInfo: {
			marginLeft: spacing,
		},
	}
}
