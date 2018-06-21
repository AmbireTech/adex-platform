export const styles = theme => {
    const spacing = theme.spacing.unit
    return {
        integrationLabel: {
            marginBottom: spacing,
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
