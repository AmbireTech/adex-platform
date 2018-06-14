export const styles = theme => {
    const spacing = theme.spacing.unit * 2
    return {
        controls: {
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'row',
            // justifyContent: 'space-between',
            marginTop: spacing,
            marginBottom: spacing,
        },
        flexRow: {
            display: 'flex',
            flexDirection: 'row',
        },
        flexItem: {
            marginLeft: spacing,
            marginRight: spacing,
            // flexGrow: 1
        }
    }
}