export const styles = theme => {
    const spacing = theme.spacing.unit
    return {
        addrListItem: {
            '&:hover': {
                cursor: 'pointer'
            }
        },
        addrInfo: {
            display: 'flex',
            flexWrap: 'wrap',
            flexGrow: 1,
            paddingTop: spacing,
            whiteSpace: 'normal',
            '& strong': {
                marginRight: spacing * 2
            }
        },
        addrInfoLabel: {
            color: theme.palette.text.hint,
            fontWeight: 'bold'
        },
        dialogPaper: {
            height: '80vh',
            margin: spacing * 2,
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
            overflow: 'visible'
        },
        tabsContainer: {
            display: 'flex',
            flexGrow: 1,
            overflowY: 'auto',
            position: 'relative',
            margin: spacing,
            marginTop: spacing * 2
        },
        backdrop: {
            backgroundColor: 'rgba(255, 255, 255, 0.5)'
        },
        tabLogo: {
            // maxWidth: '100%',
            height: spacing * 4,
            width: 'auto'
        },
        tabLabel: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
        },
        dlBtnImg: {
            maxWidth: '100%',
            maxHeight: spacing * 9,
            width: 'auto',
            height: 'auto'
        },
        leftBtnIcon: {
            marginRight: spacing
        },
        adexLogoTop: {
            position: 'absolute',
            top: '-6vh',
            left: 0
        },
        logo: {
            width: '12.8vh',
            height: '5vh'
        }
    }
}