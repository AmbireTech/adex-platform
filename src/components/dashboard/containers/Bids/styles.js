export const styles = theme => {
    const spacing = theme.spacing.unit
    // const iconButtonSize = 48 - (spacing * 2)
    return {
        compactCol: {
            maxWidth: 80
        },
        ellipsis: {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        }
    }
}
