export const styles = theme => {
    const spacing = theme.spacing.unit
    return {
        paper: {
            padding: spacing * 2,
            display: 'flex',
            flex: '1 1',
            flexDirection: 'column',
            justifyContent: 'space-between'
        },
        btns: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between'
        },
        btnIconLeft: {
            marginRight: theme.spacing.unit
        },
        iconLink: {
            color: 'inherit'
        },
        linkIcon: {
            width: 'auto'
        }
    }
}
