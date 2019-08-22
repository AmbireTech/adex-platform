export const styles = theme => {
	const spacing = theme.spacing(1)
	return {
		appBar: {
			marginBottom: spacing,
		},
		tabsContainer: {
			display: 'flex',
			flexGrow: 1,
			overflowY: 'auto',
			position: 'relative',
		},
	}
}
