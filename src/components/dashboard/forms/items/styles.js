export const styles = theme => {
	// const spacing = theme.spacing(1)
	return {
		imgPreview: {
			maxHeight: 120,
			width: 'auto',
			maxWidth: '100%',
			height: 'auto',
			boxShadow: theme.shadows[2],
		},
		imgPreviewWrapper: {
			height: 'max-content',
		},
	}
}
