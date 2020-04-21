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
			border: `1px dashed ${theme.palette.grey[500]}`,
			background: theme.palette.background.default,
			padding: 10,
			cursor: 'pointer',
			overflow: 'hidden',
		},
		imgDropzonePreview: {
			maxHeight: 320,
			maxWidth: '100%',
			height: 'auto',
			width: 'auto',
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
