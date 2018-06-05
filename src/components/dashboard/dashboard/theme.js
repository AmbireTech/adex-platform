const drawerWidth = 250

const styles = theme => {
    return {
        root: {
            flexGrow: 1,
            zIndex: 1,
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            width: '100%',
        },
        appBar: {
            position: 'absolute',
            marginLeft: drawerWidth,
            [theme.breakpoints.up('md')]: {
                width: `calc(100% - ${drawerWidth}px)`,
            },
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
                position: 'relative',
            },
        },
        content: {
            flexGrow: 1,
            backgroundColor: theme.palette.background.default,
            padding: theme.spacing.unit * 3,
        },
    }
}