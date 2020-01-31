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
		// TODO: fix the component and do nou use z-index
		zIndex: 1000,
		marginTop: theme.spacing(1),
		left: 0,
		right: 0,
		overflow: 'hidden',
		height: 150,
		width: '100%',
	},
	chip: {
		margin: `${theme.spacing(1) / 2}px ${theme.spacing(1) / 2}px`,
	},
	inputRoot: {
		flexWrap: 'wrap',
	},
})
