export const styles = theme => {
    const spacing = theme.spacing.unit
    // const iconButtonSize = 48 - (spacing * 2)
    return {
        controls: {
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'row',
            marginTop: spacing,
            marginBottom: spacing,
        },
        flexRow: {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        flexItem: {
            margin: spacing
        },
        rowButton: {
            marginTop: spacing * 1.5,
            // width: iconButtonSize,
            // height: iconButtonSize
        },
        rwoButtonRoot: {
            margin: spacing / 2,
        },
        row: {
            display: 'block'
        },
        bottomControls: {
            justifyContent: 'flex-start'
        }
    }
}
