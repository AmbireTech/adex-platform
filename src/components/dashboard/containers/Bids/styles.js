export const styles = theme => {
    const spacing = theme.spacing.unit
    console.log('theme', theme)
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
            backgroundColor: theme.palette.primary.main,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'nowrap',
            alignItems: 'center',
            flexWrap: 'wrap'
        },
        tabButton: {
            opacity: 0.6,
        },
        navButton: {
            opacity: 0.6,
            marginRight: spacing,
            // marginBottom: spacing,
            color: theme.palette.primary.contrastText
        },
        datepicker: {
            marginTop: spacing,
            marginRight: spacing,
            opacity: 0.6,
            '& input, & label': {
                cursor: 'pointer'
            }

        },
        active: {
            opacity: 1,
        },
        applyBtn: {
            color: theme.palette.common.white,
            backgroundColor: theme.palette.grey[900],
            marginRight: spacing
        },
        datepickerGroup: {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center'
        },
        dataLabel: {
            color: theme.palette.primary.main
        },
        noDataLabel: {
            color: theme.palette.error.main
        }
    }
}
