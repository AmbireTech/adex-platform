export const styles = theme => {
	const spacing = theme.spacing.unit * 1
	return {
		header: {
			marginBottom: spacing
		},
		dropzone: {
			display: 'flex',
			flexDirection: 'column',
			flex: '1 1',
			height: 'auto',
			width: 'auto',
			border: `2px dashed ${theme.palette.grey[500]}`,
			background: theme.palette.background.default,
			alignItems: 'center',
			justifyContent: 'center',
			padding: 10,
			cursor: 'pointer',
			overflow: 'hidden'
		},
		droppedImgContainer: {
			textAlign: 'center',
			alignSelf: 'stretch',
			flex: '1 1',
			flexDirection: 'row',
			display: 'flex',
			justifyContent: ' space-around',
			alignItems: 'center',
			'@media(max-width:768px)': {
				display: 'grid',
			}
		},
		imgDropzonePreview: {
			maxHeight: 320,
			height: 'auto',
			width: 'auto',
			'@media(max-width:500px)': {
				// TODO: Find out why it breaks this limit after a new pic is uploaded
				width: '100%'
			}
		},
		dropzoneBtn: {
			marginBottom: spacing,
			marginRight: spacing
		},
		leftIcon: {
			marginRight: spacing
		},
		uploadActions: {
			marginTop: spacing
		},
	}
}