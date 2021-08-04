import { fade } from '@material-ui/core/styles/colorManipulator'

export const styles = theme => {
	const spacing = theme.spacing(3)
	const spacingXS = theme.spacing(1)

	const width = ({ dialogWidth }) => dialogWidth || 1024
	const height = ({ dialogHeight }) =>
		dialogHeight || `calc(100vh - ${spacing}px)`
	return {
		dialog: {
			maxHeight: `calc(100vh - ${spacing}px)`,
			maxWidth: `calc(100vh - calc(100vh - 100%)) - ${spacing}px`,
			height,
			width,
			backgroundColor: theme.palette.background.default,
			borderRadius: 0,
			// backgroundColor: theme.palette.background.default,
			backgroundImage:
				theme.type === 'dark'
					? `radial-gradient(
				circle,
				${fade(
					theme.palette.background.special || theme.palette.background.default,
					0.333
				)} 0%,
				${fade(theme.palette.background.default, 0.69)} 100%
			)`
					: 0,
			margin: 0,
			[theme.breakpoints.down('xs')]: {
				maxHeight: `calc(100vh - calc(100vh - 100%)) - ${spacing}px`,
				maxWidth: `calc(100vw - ${spacingXS}px)`,
			},
		},
		dialogTitle: {
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			wordWrap: 'break-word',
			margin: spacing,
			marginBottom: 0,
			padding: 0,
			[theme.breakpoints.down('xs')]: {
				margin: spacingXS,
			},
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
			[theme.breakpoints.down('xs')]: {
				margin: spacingXS,
			},
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
			[theme.breakpoints.down('xs')]: {
				bottom: spacingXS,
				right: spacingXS,
			},
		},
		breakLong: {
			wordBreak: 'break-word',
			overflowWrap: 'break-word',
			hyphens: 'auto',
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
