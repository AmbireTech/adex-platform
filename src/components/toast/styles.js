export const styles = theme => {
    // const spacing = theme.spacing.unit
    return {
        snackbar: {
            border: '3px solid',
            borderRadius: 0,
            backgroundColor: '#222',
            '&.active': {
                transform: 'translateY(-20%)'
            }
        },
        warning: {
            borderColor: '#FFAB00',
            color: '#FFAB00'
        },

        cancel: {
            borderColor: '#FF5722',
            color: '#FF5722'
        },
        accept: {
            borderColor: '#00E676',
            color: '#00E676'
        }
    }
}