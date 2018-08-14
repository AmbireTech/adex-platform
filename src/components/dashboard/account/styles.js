export const styles = theme => {
    const spacing = theme.spacing.unit
    return {
        itemActions: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end'
        },
        actionBtn: {
            marginLeft: spacing
        },
        address: {
            wordWrap: 'break-word'
        }
    }
}