export const styles = theme => {
	const spacing = theme.spacing(1)

	return {
		infoStatsContainer: {
			display: 'flex',
			flexDirection: 'row',
			flexWrap: 'wrap',
			justifyContent: 'stretch',
			height: '100%'
		},
		infoCard: {
			margin: spacing,
			flexGrow: 1
		},
		linkCard: {
			'&:hover, &:focus': {
				cursor: 'pointer'
			}
		},
		dashboardCardBody: {
			margin: spacing,
			padding: spacing,
			width: `calc(100% - ${spacing * 2}px)`
		}
	}
}