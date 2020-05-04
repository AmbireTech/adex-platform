export const styles = theme => {
	const spacing = theme.spacing(1)
	return {
		dropzone: {
			marginBottom: spacing,
			display: 'flex',
			flexDirection: 'column',
			flex: '1 1',
			height: 'auto',
			width: 'auto',
			border: `1px dashed ${theme.palette.grey.main}`,
			background: theme.palette.background.default,
			padding: 10,
			cursor: 'pointer',
			overflow: 'hidden',
		},
		imgDropzonePreview: {
			height: 320,
			width: 'auto',
			maxWidth: '100%',
			maxHeight: '30vh',
			display: 'flex',
			alignItems: 'center',
			flexDirection: 'column',
			justifyContent: 'center',
		},
		dropzoneBtn: {
			marginBottom: spacing,
			marginRight: spacing,
		},
		leftIcon: {
			marginRight: spacing,
		},
		uploadActions: {
			marginTop: spacing,
		},
	}
}
