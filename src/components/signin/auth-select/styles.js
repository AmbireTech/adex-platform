export const styles = theme => {
	return {
		actions: {
			justifyContent: 'center',
		},
		btnLogo: {
			height: '2rem',
			marginRight: theme.spacing(1),
		},
		btnLogoNoTxt: {
			marginRight: 0,
		},
		metamaskBtn: {
			backgroundColor: theme.palette.grey[800],
			color: theme.palette.common.white,
		},
		trezorBtn: {
			backgroundColor: theme.palette.common.white,
		},
	}
}
