const drawerWidth = 250

export const styles = theme => ({
    root: {
        flexGrow: 1,
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
    },
    appBar: {
        top: 0,
        left: 0,
        right: 0,
        width: 'auto',
        position: 'fixed',
        // marginLeft: drawerWidth,
        [theme.breakpoints.up('md')]: {
            // width: `calc(100% - ${drawerWidth}px)`,
            left: drawerWidth,
        },
        backgroundColor: '#eee',
        color: '#000'
    },
    flex: {
        flex: 1,
        flexDirection: 'row',
        display: 'flex',
        alignItems: 'center'
    },

    flexRow: {
        display: 'flex',
        alignItems: 'center',
        flexBasis: '100%',
        paddingTop: theme.spacing.unit * 0.5,
        paddingBottom: theme.spacing.unit * 0.5,
        '&:last-child': {
            paddingRight: 100,
            paddingTop: theme.spacing.unit * 1.5,
            paddingBottom: theme.spacing.unit * 1.5,
            paddingLeft: theme.spacing.unit * 1.5,
        },

    },
    toolbarControls: {
        justifyContent: 'flex-end'
    },
    toolbarTitle: {
        justifyContent: 'flex-start'
    },
    navIconHide: {
        marginRight: 10,
        [theme.breakpoints.up('md')]: {
            display: 'none',
        },
    },
    toolbar: {
        flexFlow: 'wrap',
        height: 114,
        ...theme.mixins.toolbar
    },
    drawerPaper: {
        width: drawerWidth,
        [theme.breakpoints.up('md')]: {
            position: 'fixed',
        },
        backgroundColor: '#3c3c3c'
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3,
        overflow: 'auto',
        [theme.breakpoints.up('md')]: {
            marginLeft: drawerWidth,
        },
    },
    icon: {
        height: 36,
        width: 'auto',
        marginRight: 10,
        paddingLeft: theme.spacing.unit * 1.5,
        [theme.breakpoints.down('xs')]: {
            display: 'none',
        },
    }
})