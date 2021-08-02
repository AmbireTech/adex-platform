export const styles = theme => {
	return {
		copyBtn: {
			backgroundColor: theme.palette.appBar.main,
			overflowWrap: 'anywhere',
			userSelect: 'text',
			textTransform: 'none',
		},
		title: {
			fontSize: '2rem',
			textAlign: 'center',
			textTransform: 'uppercase',
		},
		subtitle: {
			fontSize: '1rem',
			textAlign: 'center',
			textTransform: 'uppercase',
		},
		paper: {
			height: '100%',
		},
		info: {
			fontSize: '10px',
		},
		infoGrid: {
			textAlign: 'right',
		},
		infoTitle: {
			fontSize: '12px',
		},
		img: {
			width: '100%',
		},
		labelImg: {
			height: theme.spacing(5),
			width: theme.spacing(5),
			marginRight: theme.spacing(2),
			backgroundColor: theme.palette.common.white,
		},
	}
}
