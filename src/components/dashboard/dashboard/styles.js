const drawerWidth = 250
const lastRowRightReserved = 169

export const styles = theme => {
	return {
		root: {
			marginTop: 69,
			flexGrow: 1,
			overflow: 'hidden',
			position: 'relative',
			display: 'flex',
			height: 'calc(100vh - 69px)',
			width: '100vw',
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
		toolbar: {
			flexFlow: 'wrap',
			height: 69,
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
			paddingTop: theme.spacing(2),
			overflow: 'auto',
			[theme.breakpoints.up('md')]: {
				marginLeft: drawerWidth,
				padding: theme.spacing(2),
				paddingTop: theme.spacing(2),
			},

			[theme.breakpoints.down('xs')]: {
				padding: theme.spacing(1),
			},
		},
		contentInner: {
			maxWidth: 1420,
			margin: 'auto',
			marginBottom: theme.spacing(2),
			// Because of the floating button and table paging
			[theme.breakpoints.down('sm')]: {
				paddingBottom: 146 + theme.spacing(2),
			},
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
