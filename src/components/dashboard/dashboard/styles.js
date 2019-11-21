const drawerWidth = 250

export const styles = theme => {
	return {
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
			color: '#000',
		},
		flex: {
			flex: 1,
			flexDirection: 'row',
			display: 'flex',
			alignItems: 'center',
		},

		flexRow: {
			display: 'flex',
			alignItems: 'center',
			flexBasis: '100%',
			paddingTop: theme.spacing(1),
			paddingBottom: theme.spacing(1),
			'&:last-child': {
				paddingRight: 240,
				paddingTop: theme.spacing(1),
				paddingBottom: theme.spacing(1),
				paddingLeft: theme.spacing(1),
			},
		},
		toolbarControls: {
			justifyContent: 'flex-end',
		},
		toolbarTitle: {
			justifyContent: 'flex-start',
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
			...theme.mixins.toolbar,
		},
		drawerPaper: {
			width: drawerWidth,
			[theme.breakpoints.up('md')]: {
				position: 'fixed',
			},
			backgroundColor: '#fff',
		},
		content: {
			flexGrow: 1,
			backgroundColor: theme.palette.background.default,
			padding: theme.spacing(3),
			paddingTop: theme.spacing(5),
			overflow: 'auto',
			[theme.breakpoints.up('md')]: {
				marginLeft: drawerWidth,
			},
		},
		contentInner: {
			maxWidth: 1600,
			margin: 'auto',
		},
		icon: {
			height: 36,
			width: 'auto',
		},
	}
}
