export const styles = theme => ({
	root: {
		padding: "2px 4px",
		display: "flex",
		alignItems: "center",
		height: 60,
		width: "100%"
	},
	input: {
		marginLeft: `${theme.spacing.unit}`,
		flex: 1
	},
	iconButton: {
		padding: `${theme.spacing.unit + 2}`
	},
	progress: {
		width: `${theme.spacing.unit * 5}`
	}
})
