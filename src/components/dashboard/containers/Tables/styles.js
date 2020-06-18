export const styles = theme => ({
	cellImg: {
		// Fixed width to avoid col resizing while loading
		height: 46,
		width: 69,
		cursor: 'pointer',
		display: 'flex',
	},
	actions: {
		'& > *': {
			margin: theme.spacing(0.5),
		},
	},
})
