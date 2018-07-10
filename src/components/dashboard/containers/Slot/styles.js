export const styles = theme => {
    const spacing = theme.spacing.unit
    return {
        integrationLabel: {
            marginBottom: spacing,
            color: theme.palette.text.hint,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        integrationCode: {
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            padding: spacing,
            margin: 0,
            alignSelf: 'flex-start'
        },
        copyButton: {
            // justifyContent: 'flex-end'
        }
    }
}
