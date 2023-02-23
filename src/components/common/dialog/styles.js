export const styles = theme => {
	const spacing = theme.spacing(2)
	return {
		dialog: {
			marginTop: 74 + spacing * 2,
			height: `calc(100vh - ${spacing}px - 74px)`,
			minWidth: 1024,
			maxWidth: 1080,
			backgroundColor: theme.palette.appBar.main,
			'@media(max-width:1080px)': {
				maxWidth: '100%',
				minWidth: `calc(100vw - ${spacing}px)`,
			},
		},
		dialogTitle: {
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			wordWrap: 'break-word',
			margin: spacing,
			marginLeft: theme.spacing(2),
			marginBottom: 0,
			padding: 0,
		},
		content: {
			display: 'flex',
			flexDirection: 'column',
			flex: '1 1 auto',
			position: 'relative',
			padding: 0,
			margin: spacing,
			overflow: 'visible',
			overflowY: 'auto',
		},
		contentBox: {
			display: 'flex',
			flexDirection: 'column',
			flex: 1,
		},
		propRow: {
			margin: '10px 0',
			width: '100%',
		},
		contentBody: {
			flexGrow: 1,
		},
		contentTopLoadingCircular: {
			flexShrink: 0,
			marginRight: theme.spacing(1),
		},
		contentTopLoading: {
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
			'& > div': {
				padding: theme.spacing(1),
			},
		},
		textBtn: {
			cursor: 'pointer',
		},
		btnIconLeft: {
			marginRight: theme.spacing(1),
		},
		leftCol: {
			textTransform: 'uppercase',
			// color: var(--color-adex-neutral-contrast-lighter);
			textAlign: 'right',
			[theme.breakpoints.down('sm')]: {
				textAlign: 'left',
			},
		},
		rightCol: {
			textAlign: 'left',
		},
		progressCircleCenter: {
			position: 'absolute',
			left: 'calc(50% - 30px)',
			top: 'calc(50% - 30px)',
		},
		floating: {
			position: 'sticky',
			top: 0,
			left: 0,
			marginBottom: theme.spacing(1),
			zIndex: theme.zIndex.appBar,
			'& svg': {
				marginRight: theme.spacing(1),
			},
			[theme.breakpoints.down('sm')]: {
				marginBottom: 0,
				position: 'fixed',
				top: 'auto',
				left: 'auto',
				bottom: spacing,
				right: spacing,
			},
		},
		breakLong: {
			wordBreak: 'break-word',
			overflowWrap: 'break-word',
			hyphens: 'auto',
		},
		demoImg: {
			top: 'auto',
			left: 'auto',
			right: 0,
			bottom: 0,
			width: '100px',
			height: 'auto',
			position: 'absolute',
		},
		demoBody: {
			position: 'relative',
		},
		contentStickyTop: {
			marginBottom: '2rem',
			position: 'sticky',
			top: 0,
			zIndex: theme.zIndex.appBar,
			backgroundColor: theme.palette.appBar.main,
		},
		fullContentMessage: {
			display: 'flex',
			flex: 1,
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
		},
	}
}
