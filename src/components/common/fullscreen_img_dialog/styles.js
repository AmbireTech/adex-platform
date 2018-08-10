
export const styles = theme => {
    return {
        dialog: {
            '@media(max-width:1080px)': {
                maxWidth: '100%',
                minWidth: `calc(100vw - ${theme.spacing.unit * 2}px)`,
            },
            '@media(max-height:823px)': {
                minHeight: `calc(100vh - ${theme.spacing.unit * 2}px)`,
            }
        },
        dialogImage: {
            '@media(max-width:1080px)': {
                maxWidth: '75vw',
                maxHeight: '100%',
                display: 'block',
                margin: 'auto'
            }
        }
    }
}