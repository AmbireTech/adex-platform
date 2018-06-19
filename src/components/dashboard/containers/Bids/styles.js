import { common } from "@material-ui/core/colors";

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
        navButton: {
            opacity: 0.6,
            marginRight: spacing,
            // marginBottom: spacing,
            color: theme.palette.primary.contrastText
        },
        active: {
            opacity: 1,
            texDecoration: 'underlined'
        },
        applyBtn: {
            color: theme.palette.common.white,
            backgroundColor: theme.palette.grey[900],
            marginRight: spacing
        },
        datepicker: {
            backgroundColor: theme.palette.common.white,
            padding: spacing,
            marginRight: spacing
        },
        datepickerGroup: {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap'
        }
    }
}
