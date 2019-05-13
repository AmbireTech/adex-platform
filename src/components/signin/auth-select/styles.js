export const styles = theme => {
	const spacing = theme.spacing.unit
	return {
		backdrop: {
			backgroundColor: 'rgba(255, 255, 255, 0.5)'
		},
		card: {
			display: 'block',
			width: '100%',
			opacity: 0.7,
			'&.disabled': {
				opacity: 0.3
			}
		}
	}
}