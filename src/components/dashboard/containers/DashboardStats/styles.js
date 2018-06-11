export const styles = theme => {
    const spacing = theme.spacing.unit * 1

    return {
        infoStatsContainer: {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'stretch'
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
        statsContainer: {
            maxWidth: 1600,
            margin: 'auto'
        },
        dashboardCardBody: {
            margin: spacing,
        }
    }
}