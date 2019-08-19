export const styles = theme => {
	const spacing = theme.spacing(1)
	return {
		wrapper: {
			margin: `${spacing * 2}px auto`,
			maxWidth: 1000,
		},
		img: {
			maxWidth: '100%',
			height: 'auto',
		},
	}
}
