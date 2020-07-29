export const styles = theme => {
	const spacing = theme.spacing(1)

	return {
		infoStatsContainer: {
			display: 'flex',
			flexDirection: 'row',
			flexWrap: 'wrap',
			justifyContent: 'stretch',
			height: '100%',
		},
		infoCard: {
			margin: spacing,
			flexGrow: 1,
		},
		linkCard: {
			'&:hover, &:focus': {
				cursor: 'pointer',
			},
		},
		dashboardCardBody: {
			margin: spacing,
			padding: spacing,
			width: `calc(100% - ${spacing * 2}px)`,
		},
		cardIcon: {
			position: 'absolute',
			bottom: '-33px',
			right: '-33px',
			fontSize: '120px',
			opacity: '0.13',
			transform: 'rotate(-45deg)',
			pointerEvents: 'none',
		},
		// NOTE: need this to match multilenie datepicker and dropdown heights
		datePicker: {
			paddingTop: 9.108,
			paddingBottom: 9.108,
		},
	}
}
