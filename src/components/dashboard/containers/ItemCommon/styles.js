export const styles = theme => {
    const spacing = theme.spacing.unit * 1

    return {
        card: {
            marginRight: spacing,
            marginBottom: spacing,
            width: 320,
            display: 'block',
            position: 'relative',
            maxWidth: '100%',
            '@media(max-width:380px)': {
                margin: 0,
                marginBottom: spacing,
            }
        },
        mediaRoot: {
            height: 0,
            paddingTop: '56.25%', // 16:9
            position: 'relative',
            overflow: 'hidden'
        },
        img: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            margin: 'auto',
            minWidth: '50%',
            minHeight: '50%',
            height: 'auto',
            width: '100%'
        },
        basicInfo: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'start',
            flexWrap: 'wrap'
        },
        buttonRight: {
            marginLeft: spacing
        },
        error: {
            color: theme.palette.error.main
        },
        
    }
}