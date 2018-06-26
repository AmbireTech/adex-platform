import color from '@material-ui/core/colors/purple'

export const styles = theme => ({
    root: {
        display: 'flex',
        alignItems: 'center',
    },
    wrapper: {
        position: 'relative',
    },
    buttonSuccess: {
        backgroundColor: color[500],
        '&:hover': {
            backgroundColor: color[700],
        },
    },
    fabProgress: {
        color: color[500],
        position: 'absolute',
        top: -6,
        left: -6,
        zIndex: 1,
    },
    buttonProgress: {
        color: color[500],
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
    position: {
        position: 'fixed',
        top: 86,
        right: 40,
        zIndex: theme.zIndex.appBar
    }
})
