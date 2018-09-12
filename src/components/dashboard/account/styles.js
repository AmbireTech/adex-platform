export const styles = theme => {
    const spacing = theme.spacing.unit
    return {
        itemActions: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center'
        },
        actionBtn: {
            marginLeft: spacing,
            marginBottom: spacing,
            '@media(min-width:450px)': {
                minWidth: '225px'
            }
        },
        address: {
            wordWrap: 'break-word'
        }
    }
}