export const styles = theme => {
    const spacing = theme.spacing.unit
    return {
        dialogPaper: {
            // height: '80vh',
            // margin: spacing * 2,
        },
        backdrop: {
            backgroundColor: 'rgba(255, 255, 255, 0.5)'
        },
        sideBox: {
            display: 'inline-block',
            width: '50%',
            height: 'auto',
            textAlign: 'center',
            verticalAlign: 'top',
            opacity: 0.7,
            '&:hover:not(.disabled)': {
                cursor: 'pointer',
                opacity: 1
            },
            '&.disabled': {
                opacity: 0.3
            }
        },
        icon: {
            width: 110,
            height: 110,
            margin: 'auto'
        },
        salePoints: {
            padding: 0,
            '& li': {
                display: 'block',
                listStyle: 'none'
            }
        }
    }
}