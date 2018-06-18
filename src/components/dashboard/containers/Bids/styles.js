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
        },
        navLeft: {
            display: 'flex',
            flexGrow: 3,
            flexDirection: 'row',
            flexFlow: 'wrap'
        },
        navRight: {
            display: 'flex',
            flexGrow: 3,
            flexDirection: 'row',
            flexFlow: 'wrap',
            justifyContent: 'flex-end'
        },
        horizontal: {
            // paddingTop: spacing,
            // paddingBottom: spacing,
            // backgroundColor: '#0277bd',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'nowrap'
        },
        navButton: {
            opacity: 0.6
        },
        active: {
            opacity: 1,
            texDecoration: 'underlined'
        }
    }
}
