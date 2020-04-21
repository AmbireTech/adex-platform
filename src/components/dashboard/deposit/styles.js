export const styles = theme => {
	return {
		root: {
			maxWidth: 400,
			// minHeight: 300,
			height: '100%',
			flexGrow: 1,
			display: 'flex',
			flex: 1,
			flexDirection: 'column',
			justifyContent: 'space-between',
		},
		badgeFull: {
			width: '100%',
		},
		copyBtn: {
			backgroundColor: '#E2EAED',
			overflowWrap: 'anywhere',
			userSelect: 'text',
		},
		bullet: {
			display: 'inline-block',
			margin: '0 2px',
			transform: 'scale(0.8)',
		},
		authImg: {
			width: '1em',
			height: '1em',
			display: 'flex',
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
		pos: {
			marginBottom: 12,
		},
		actions: {
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
		},
		onRampLogo: {
			margin: '10px',
		},
		onRamp: {
			display: 'flex',
			justifyContent: 'space-between',
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
		rampInfoTitle: {
			fontSize: '0.8rem',
		},
		listItem: {
			display: 'flex',
			flexWrap: 'wrap',
			flex: 1,
			maxWidth: '100%',
		},
		img: {
			maxWidth: '100%',
		},
	}
}
