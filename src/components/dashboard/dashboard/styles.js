const drawerWidth = 250
const lastRowRightReserved = 240

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
		},
		flex: {
			flex: 1,
			flexDirection: 'row',
			display: 'flex',
			alignItems: 'center',
			paddingRight: theme.spacing(2),
			paddingLeft: theme.spacing(2),
		},

		flexRow: {
			display: 'flex',
			alignItems: 'center',
			flexBasis: '100%',
			paddingBottom: theme.spacing(1),
			'&:last-child': {
				paddingRight: lastRowRightReserved,
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
			paddingRight: 0,
			paddingLeft: 0,
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
			padding: theme.spacing(2),
			paddingTop: theme.spacing(4),
			overflow: 'auto',
			[theme.breakpoints.up('md')]: {
				marginLeft: drawerWidth,
			},
		},
		contentInner: {
			maxWidth: 1600,
			margin: 'auto',
		},
		breadcrumbElement: {
			maxWidth: `calc(100vw - ${theme.spacing(5)}px)`,
			[theme.breakpoints.up('md')]: {
				maxWidth: `calc(100vw - ${theme.spacing(5) +
					drawerWidth +
					lastRowRightReserved}px)`,
			},
		},
	}
}
