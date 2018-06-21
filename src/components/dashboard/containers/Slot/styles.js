export const styles = theme => {
    const spacing = theme.spacing.unit
    console.log(theme)
    // const iconButtonSize = 48 - (spacing * 2)
    return {
        integrationLabel: {
            fontSize: 12,
            marginBottom: 6,
            color: theme.palette.text.hint
        },
        integrationCode: {
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            padding: spacing,
            margin: 0,
            alignSelf: 'flex-start'
        }
    }
}
