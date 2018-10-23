export const styles = theme => {
    const spacing = theme.spacing.unit * 1

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
            '@media(max-width:960px)': {
                minWidth: `calc(100vw - ${spacing * 8}px)`,
                maxWidth: `calc(100vw - ${spacing * 8}px)`
            }
        }
    }
}