export const styles = theme => {
    const spacing = theme.spacing.unit * 1

    return {
        card: {
            margin: spacing,
            width: 270,
            display: 'block',
            position: 'relative',
            maxWidth: '100%',
            '@media(max-width:360px)': {
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
        cardMediaRoot: {

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
        }
    }
}