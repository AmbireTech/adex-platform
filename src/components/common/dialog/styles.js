
import grey from '@material-ui/core/colors/grey'
import { relative } from 'path';

export const styles = theme => {
    const spacing = theme.spacing.unit * 3
    return {
        dialog: {
            minHeight: '90vh',
            minWidth: 1024,
            maxWidth: 1080,
            backgroundColor: grey[200], // TODO: color,
            maxHeight: '100vh',
            '@media(max-width:1080px)': {
                maxWidth: '100%',
                minWidth: `calc(100vw - ${theme.spacing.unit * 2}px)`,
            },
            '@media(max-height:823px)': {
                minHeight: `calc(100vh - ${theme.spacing.unit * 2}px)`,
            }
        },
        dialogTitle: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        content: {
            display: 'flex',
            flexDirection: 'column',
            flex: '1 1 auto',
            position: 'relative',
            padding: 0,
            margin: `0 ${spacing}px ${spacing}px ${spacing}px`,
            '&:first-child': {
                paddingTop: spacing,
            },
            overflow: 'visible',
            overflowY: 'auto'
        },
        contentBox: {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column'
        },
        propRow: {
            margin: '10px 0',
            width: '100%'
        },
        contentBody: {
            flexGrow: 1,
        },
        contentTopLoadingCircular: {
            flexShrink: 0,
            marginRight: theme.spacing.unit
        },
        contentTopLoading: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            '& > div': {
                padding: theme.spacing.unit
            }
        },
        textBtn: {
            cursor: 'pointer'
        },
        btnIconLeft: {
            marginRight: theme.spacing.unit
        },
        leftCol: {
            textTransform: 'uppercase',
            // color: var(--color-adex-neutral-contrast-lighter);
            textAlign: 'right',
            [theme.breakpoints.down('sm')]: {
                textAlign: 'left',
            },
        },
        rightCol: {
            textAlign: 'left'
        },
        progressCircleCenter: {
            position: 'absolute',
            left: 'calc(50% - 30px)',
            top: 'calc(50% - 30px)'
        },
        floating: {
            position: 'fixed',
            top: 86,
            right: 40,
            zIndex: theme.zIndex.appBar
        },
        breakLong: {
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            hyphens: 'auto'
        },
        demoImg: {
            top: 'auto',
            left: 'auto',
            right: 0,
            bottom: 0,
            width: '100px',
            height: 'auto',
            position: 'absolute'
        },
        demoBody: {
            position: 'relative'
        }
    }
}