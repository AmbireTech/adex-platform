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
    },
    flex: {
        flex: 1,
        flexDirection: 'row',
        display: 'flex',
        alignItems: 'center'
    },
    navIconHide: {
        [theme.breakpoints.up('md')]: {
            display: 'none',
        },
    },
    toolbar: theme.mixins.toolbar,
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
        marginRight: 10
    }
})