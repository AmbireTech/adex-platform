export const styles = theme => ({
	root: {
		flexGrow: 1,
		height: 250,
	},
	container: {
		flexGrow: 1,
		position: 'relative',
	},
	paper: {
		position: 'absolute',
		zIndex: 1,
		marginTop: theme.spacing.unit,
		left: 0,
		right: 0,
		overflow: 'auto',
		maxHeight: 150
	},
	chip: {
		margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 2}px`,
	},
	inputRoot: {
		flexWrap: 'wrap',
	},
})