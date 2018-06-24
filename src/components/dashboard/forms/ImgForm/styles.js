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
            height: 190,
            border: `2px dashed ${theme.palette.grey[500]}`,
            background: theme.palette.background.default,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 10,
            cursor: 'pointer',
            overflow: 'hidden',

        },
        droppedImgContainer: {
            textAlign: 'center',
            alignSelf: 'stretch',
            flex: '1 1',
            flexDirection: 'row',
            display: 'flex',
            justifyContent: ' space-around',
            alignItems: 'center'
        },
        imgDropzonePreview: {
            maxHeight: 176,
            height: 'auto',
            width: 'auto',
            maxWidth: '70%'
        },
        imgForm: {
            textAlign: 'left'
        },
        dropzoneBtn: {
            marginBottom: spacing,
            marginRight: spacing
        },
        leftIcon: {
            marginRight: spacing
        }
    }
}