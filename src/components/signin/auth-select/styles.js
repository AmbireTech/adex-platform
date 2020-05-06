export const styles = theme => {
	return {
		actions: {
			justifyContent: 'center',
		},
		limitedWidthBtn: {
			wordBreak: 'break-word',
			textAlign: 'center',
		},
		btnLogo: {
			height: '2rem',
			marginRight: theme.spacing(1),
		},
		btnLogoNoTxt: {
			marginRight: 0,
		},
		metamaskBtn: {
			backgroundColor: theme.palette.common.white,
			color: theme.palette.common.black,
		},
		trezorBtn: {
			backgroundColor: theme.palette.common.white,
			color: theme.palette.common.black,
		},
	}
}
