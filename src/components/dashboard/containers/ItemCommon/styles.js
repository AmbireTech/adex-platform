export const styles = theme => {
	const spacing = theme.spacing(1)
	const aspect = '56.25%'

	return {
		card: {
			backgroundColor: theme.palette.grey.main,
			width: '100%',
			display: 'block',
			position: 'relative',
			maxWidth: '100%',
		},
		mediaRoot: {
			height: 0,
			paddingTop: aspect, // 16:9
			position: 'relative',
			overflow: 'hidden',
		},
		img: {
			position: 'absolute',
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,
			margin: 'auto',
			// minWidth: '50%',
			// minHeight: '50%',
			height: 'auto',
			maxWidth: '100%',
			width: 'auto',
			maxHeight: '100%',
		},
		basicInfo: {
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'start',
			flexWrap: 'wrap',
		},
		buttonRight: {
			marginLeft: spacing,
		},
		error: {
			color: theme.palette.error.main,
		},
		label: {
			marginBottom: spacing,
			color: theme.palette.text.hint,
		},

		buttonLeft: {
			marginRight: spacing,
		},

		textField: {
			marginBottom: spacing,
			marginRight: spacing,
		},
		top: {
			display: 'flex',
			flexDirection: 'column',
			flexWrap: 'wrap',
			maxWidth: '70%',
		},
		changesLine: {
			display: 'flex',
			flexDirection: 'row',
			flexWrap: 'wrap',
			alignItems: 'center',
		},
		changeChip: {
			marginRight: spacing,
			marginBottom: spacing / 2,
			marginTop: spacing / 2,
		},
		editIcon: {
			position: 'absolute',
			bottom: spacing,
			right: spacing,
		},
		mediaPropChip: {
			position: 'absolute',
			top: spacing,
			left: spacing,
		},
		changeControls: {
			position: 'sticky',
			top: 0,
			zIndex: theme.zIndex.appBar,
		},
		changeControlsPaper: {
			[theme.breakpoints.down('sm')]: {
				marginBottom: 0,
			},
		},
		itemTabsBar: {
			// borderBottom: 0,
		},
		itemTabsContainer: {
			borderTop: 0,
			backgroundColor: theme.palette.background.default,
		},
	}
}
