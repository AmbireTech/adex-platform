export const styles = theme => {
	const spacing = theme.spacing(1)
	return {
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
		scrollableList: {
			width: '100%',
			position: 'relative',
			overflow: 'auto',
			maxHeight: 280,
		},
		iconBtnLeft: {
			marginRight: theme.spacing(1),
		},
		currentChip: {
			height: '1.1rem',
			margin: '0 10px',
		},
	}
}
