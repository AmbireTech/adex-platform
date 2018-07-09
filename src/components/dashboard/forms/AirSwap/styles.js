export const styles = theme => {
    const spacing = theme.spacing.unit
    return {
        paper: {
            // padding: spacing * 2,
            display: 'flex',
            flex: '1 1',
            flexDirection: 'column',
            justifyContent: 'space-between'
        },
        btns: {
            paddingLeft: spacing * 2,
            paddingRight: spacing * 2,
            paddingBottom: spacing,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            flex: '1 1'
        },
        btnIconLeft: {
            marginRight: theme.spacing.unit
        },
        iconLink: {
            color: 'inherit'
        },
        linkIcon: {
            width: 'auto'
        },
        infoStatsContainer: {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'stretch'
        },
        actionBtn: {
            margin: spacing
        }
    }
}
