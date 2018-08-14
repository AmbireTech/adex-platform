export const styles = {
    root: {
        color: 'purple',
        '&$active': {
            color: 'green'
        }
    },
    active: {
        color: 'yellow'
    },
    pagePaper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        top: 115,
    },
    pageContent: {
        position: 'absolute',
        top: 20,
        left: 20,
        right: 20,
        bottom: 50,
        padding: 20,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
    },
    controls: {
        position: 'absolute',
        bottom: 5,
        left: 20,
        right: 20,
    },
    right: {
        textAlign: 'right',
        display: 'inline-block',
        width: '50%',
        '@media(max-width:475px)': {
            width: '86%'
        }
    },
    left: {
        display: 'inline-block',
        textAlign: 'left',
        width: '50%',
        '@media(max-width:475px)': {
            width: '14%'
        }
    },
    stepperNav: {
        backgroundColor: 'black',
        '@media(max-width:500px)': {
            backgroundColor: 'black',
            width: '100px'
        }
    }
}