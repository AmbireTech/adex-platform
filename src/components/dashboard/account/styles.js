export const styles = theme => {
    const spacing = theme.spacing.unit
    return {
        itemActions: {
            display: 'flex',
            flex: '0 0 187px',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'space-around'
        },
        actionBtn: {
            marginBottom: spacing,
            '@media(min-width:450px)': {
                // minWidth: '225px'
            }
        },
        address: {
            wordWrap: 'break-word'
        }
    }
}