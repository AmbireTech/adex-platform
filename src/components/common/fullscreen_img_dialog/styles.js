
export const styles = theme => {
    return {
        dialog: {
            '@media(max-width:744px)': {
                minWidth: `calc(100vw - ${theme.spacing.unit * 2}px)`,
            },
            '@media(max-height:823px)': {
                minHeight: 'auto',
            }
        },
        dialogImage: {
            '& img': {
                height: 'auto'
            },
            '@media(max-width:1080px)': {
                maxWidth: '80vw',
                maxHeight: '100vw',
                display: 'block',
                margin: 'auto'
            }
        }
    }
}