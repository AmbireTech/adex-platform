export const styles = (theme) => {
	return {
		actions: {
			justifyContent: 'center'
		},
		btnLogo: {
			height: '2rem',
			marginRight: theme.spacing(1)
		},
		btnLogoNoTxt: {
			marginRight: 0
		},
		metamaskBtn: {
			backgroundColor: theme.palette.grey[800]
		},
		trezorBtn: {
			backgroundColor: theme.palette.common.white
		}
	}
}