export const styles = () => {
	return {
		backdrop: {
			backgroundColor: 'rgba(255, 255, 255, 0.5)',
		},
		card: {
			display: 'block',
			width: '100%',
			opacity: 0.7,
			'&.disabled': {
				opacity: 0.3,
			},
		},
		gridContainer: {
			flexGrow: 1,
		},
	}
}
