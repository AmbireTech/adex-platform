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
            padding: spacing,
            '@media(max-width:959px)': {
                width: `calc(100vw - ${spacing * 8}px)`
            },
            '@media(max-width:400px)': {
                width: 'auto',
                maxWidth: '80vw',
                padding: 0
            },
        }
    }
}