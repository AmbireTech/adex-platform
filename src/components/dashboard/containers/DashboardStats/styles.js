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
        dashboardCardBody: {
            margin: spacing,
            '@media(max-width:380px)': {
                // TODO: Fit it in a better way
                marginLeft: '-20px',
                transform: 'scale(0.85, 0.85)'
            }
        }
    }
}