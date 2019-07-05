export const styles = theme => {
	const spacing = theme.spacing.unit
	return {
		flex: {
			flex: 1
		},
		appBar: {
			marginTop: spacing * 2,
			marginBottom: spacing,
		},
		datepicker: {
			margin: spacing,
			marginLeft: 0,
		}
	}
}
